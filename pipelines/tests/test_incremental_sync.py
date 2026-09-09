"""Unit and integration tests for incremental synchronization events and safety gates (P6.1.1 - P6.1.5)."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from apps.api.db.base import Base
from apps.api.db.models.document import DocumentChunk, IndexRun, SourceDocument
from apps.api.providers.doubles import MockVectorProvider
from pipelines.ingestion.embedder import DeterministicMockEmbedder
from pipelines.ingestion.synchronizer import IncrementalSynchronizer


@pytest.fixture
async def sync_environment():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    vector_provider = MockVectorProvider()
    embedder = DeterministicMockEmbedder()

    async with session_factory() as session:
        synchronizer = IncrementalSynchronizer(
            session=session,
            vector_provider=vector_provider,
            embedder=embedder,
        )
        yield {
            "session": session,
            "vector_provider": vector_provider,
            "synchronizer": synchronizer,
            "embedder": embedder,
        }

    await engine.dispose()


@pytest.mark.asyncio
async def test_incremental_create_and_publish(sync_environment) -> None:
    """P6.1.1 & P6.1.2: Test initial document creation and vector indexing."""
    sync = sync_environment["synchronizer"]
    vp = sync_environment["vector_provider"]
    session = sync_environment["session"]

    doc_data = {
        "_id": "project-test-1",
        "_type": "project",
        "title": "Autonomous Agent",
        "slug": {"current": "autonomous-agent"},
        "ragEnabled": True,
        "overview": "An autonomous agent system executing RAG pipelines.",
    }

    result = await sync.handle_event("publish", doc_data)

    assert result.status == "completed"
    assert result.chunks_created > 0
    assert result.chunks_deactivated == 0
    assert result.vectors_upserted == result.chunks_created
    assert len(vp.points) == result.chunks_created

    # Verify audit log in index_runs (P6.1.4)
    run_res = await session.execute(select(IndexRun))
    runs = list(run_res.scalars().all())
    assert len(runs) >= 1
    assert runs[-1].status == "completed"
    assert runs[-1].chunks_created == result.chunks_created


@pytest.mark.asyncio
async def test_atomic_update_write_before_deactivate(sync_environment) -> None:
    """P6.1.2 & P6.1.3: New chunks/vectors written before old deactivated, stale Qdrant points purged."""
    sync = sync_environment["synchronizer"]
    vp = sync_environment["vector_provider"]
    session = sync_environment["session"]

    # Initial publish
    doc_v1 = {
        "_id": "project-update-test",
        "_type": "project",
        "title": "Version One",
        "slug": {"current": "version-test"},
        "ragEnabled": True,
        "overview": "Initial version one description.",
    }
    res_v1 = await sync.handle_event("publish", doc_v1)
    assert res_v1.status == "completed"

    v1_points = list(vp.points.keys())
    assert len(v1_points) > 0

    # Update with new content
    doc_v2 = {
        "_id": "project-update-test",
        "_type": "project",
        "title": "Version Two",
        "slug": {"current": "version-test"},
        "ragEnabled": True,
        "overview": "Updated version two description with substantially expanded content for RAG.",
    }
    res_v2 = await sync.handle_event("update", doc_v2)
    assert res_v2.status == "completed"
    assert res_v2.chunks_created > 0
    assert res_v2.chunks_deactivated == len(v1_points)

    # Verify stale Qdrant points were deleted (P6.1.3)
    for old_pid in v1_points:
        assert old_pid not in vp.points

    # Verify old chunks are marked is_active=False in PostgreSQL
    import uuid
    v1_uuids = [uuid.UUID(p) for p in v1_points]
    stale_chunks = await session.execute(
        select(DocumentChunk).where(DocumentChunk.id.in_(v1_uuids))
    )
    for chunk in stale_chunks.scalars().all():
        assert chunk.is_active is False


    # Verify document version incremented
    doc_res = await session.execute(
        select(SourceDocument).where(SourceDocument.sanity_id == "project-update-test")
    )
    doc = doc_res.scalar_one()
    assert doc.version == 2


@pytest.mark.asyncio
async def test_failure_preserves_previous_active_version(sync_environment) -> None:
    """P6.1.5: Verify failure during vector upsert preserves previous active version and rolls back."""
    sync = sync_environment["synchronizer"]
    vp = sync_environment["vector_provider"]
    session = sync_environment["session"]

    # Step 1: Valid initial publish
    doc_v1 = {
        "_id": "project-fail-test",
        "_type": "project",
        "title": "Stable Project",
        "slug": {"current": "stable-project"},
        "ragEnabled": True,
        "overview": "Stable initial content that must survive failed updates.",
    }
    res_v1 = await sync.handle_event("publish", doc_v1)
    assert res_v1.status == "completed"
    initial_pids = set(vp.points.keys())

    # Step 2: Simulate vector provider crash during upsert on update
    async def failing_upsert(points):
        raise ConnectionResetError("Simulated Qdrant connection failure")

    original_upsert = vp.upsert
    vp.upsert = failing_upsert

    doc_v2 = {
        "_id": "project-fail-test",
        "_type": "project",
        "title": "Corrupt Update",
        "slug": {"current": "stable-project"},
        "ragEnabled": True,
        "overview": "This update should fail and roll back safely.",
    }

    res_v2 = await sync.handle_event("update", doc_v2)
    assert res_v2.status == "failed"
    assert "Simulated Qdrant connection failure" in (res_v2.error_message or "")

    # Restore original method
    vp.upsert = original_upsert

    # Step 3: Verify old version is completely preserved and active (P6.1.5)
    assert set(vp.points.keys()) == initial_pids

    active_chunks = await session.execute(
        select(DocumentChunk).where(
            DocumentChunk.document.has(sanity_id="project-fail-test"),
            DocumentChunk.is_active.is_(True),
        )

    )
    active_chunk_ids = {str(c.id) for c in active_chunks.scalars().all()}
    assert active_chunk_ids == initial_pids


@pytest.mark.asyncio
async def test_unpublish_and_delete_events(sync_environment) -> None:
    """P6.1.1: Verify unpublish deactivates chunks/deletes vectors, and delete purges records."""
    sync = sync_environment["synchronizer"]
    vp = sync_environment["vector_provider"]
    session = sync_environment["session"]

    doc = {
        "_id": "project-lifecycle",
        "_type": "project",
        "title": "Lifecycle Project",
        "slug": {"current": "lifecycle-project"},
        "ragEnabled": True,
        "overview": "Lifecycle content testing unpublish and deletion.",
    }
    await sync.handle_event("publish", doc)
    assert len(vp.points) > 0

    # Unpublish
    unpub_res = await sync.handle_event("unpublish", doc)
    assert unpub_res.status == "completed"
    assert len(vp.points) == 0  # Vectors purged from Qdrant

    # Document still in DB but rag_enabled=False
    doc_in_db = await session.execute(
        select(SourceDocument).where(SourceDocument.sanity_id == "project-lifecycle")
    )
    found = doc_in_db.scalar_one_or_none()
    assert found is not None
    assert found.rag_enabled is False

    # Delete
    del_res = await sync.handle_event("delete", doc)
    assert del_res.status == "completed"

    doc_after_del = await session.execute(
        select(SourceDocument).where(SourceDocument.sanity_id == "project-lifecycle")
    )
    assert doc_after_del.scalar_one_or_none() is None
