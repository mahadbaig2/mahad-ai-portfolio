# pipelines/ingestion

Deterministic and idempotent extraction, normalization, chunking, and vector embedding pipeline.

## Flow
1. Extract content from Sanity CMS via GROQ API.
2. Normalize Portable Text and validate Unicode/Urdu.
3. Heading-aware chunking (350-500 tokens).
4. Embed with `intfloat/multilingual-e5-small`.
5. Store canonical chunks in PostgreSQL and vector points in Qdrant.
