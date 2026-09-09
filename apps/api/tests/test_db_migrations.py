"""Tests verifying Alembic migrations up and down from a clean database."""

from pathlib import Path

from alembic import command
from alembic.config import Config

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent


def test_alembic_migration_up_and_down(tmp_path: Path) -> None:
    """P3.2.8: Verify migration upgrade to head and downgrade to base on a clean database."""
    test_db_path = tmp_path / "test_migration.db"
    sync_sqlite_url = f"sqlite:///{test_db_path.as_posix()}"

    alembic_cfg = Config(str(REPO_ROOT / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(REPO_ROOT / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", sync_sqlite_url)

    # 1. Upgrade from clean database to head
    command.upgrade(alembic_cfg, "head")
    assert test_db_path.exists()

    # 2. Downgrade back to base
    command.downgrade(alembic_cfg, "base")

    # 3. Re-upgrade from clean state to head
    command.upgrade(alembic_cfg, "head")
