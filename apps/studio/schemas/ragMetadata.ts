import { defineField } from 'sanity';

/**
 * Standard RAG and Ingestion metadata fields for indexable documents.
 * Adheres to ADR-001 and Phase 2 requirements (P2.1.3).
 */
export const ragMetadataFields = [
  defineField({
    name: 'ragEnabled',
    title: 'Enable RAG Indexing',
    type: 'boolean',
    group: 'rag',
    description: 'When enabled, this document is ingested into PostgreSQL and the Qdrant vector index for Talk to Mahad.',
    initialValue: true,
  }),
  defineField({
    name: 'audiences',
    title: 'Target Audiences',
    type: 'array',
    group: 'rag',
    description: 'Target audience segments used by the query router and retrieval filters.',
    of: [{ type: 'string' }],
    options: {
      list: [
        { title: 'Recruiters & Talent Acquisition', value: 'recruiter' },
        { title: 'AI & Software Engineers', value: 'engineer' },
        { title: 'Founders & Product Leaders', value: 'founder' },
        { title: 'General Visitors', value: 'general' },
      ],
    },
    initialValue: ['recruiter', 'engineer', 'founder', 'general'],
  }),
  defineField({
    name: 'sensitivity',
    title: 'Sensitivity Level',
    type: 'string',
    group: 'rag',
    description: 'Access control boundary for the assistant.',
    options: {
      list: [
        { title: 'Public (Safe for external queries)', value: 'public' },
        { title: 'Internal / Restricted', value: 'internal' },
      ],
      layout: 'radio',
    },
    initialValue: 'public',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'sourceLabel',
    title: 'Source Citation Label',
    type: 'string',
    group: 'rag',
    description: 'Human-readable label displayed when this document is cited (e.g., "Sanity CMS: Architecture Decision #001").',
    validation: (Rule) => Rule.required().error('Source citation label is required for verifiable RAG provenance.'),
  }),
  defineField({
    name: 'canonicalPath',
    title: 'Canonical URL / Path',
    type: 'string',
    group: 'rag',
    description: 'Relative route on the portfolio website (e.g., "/work/multimodal-rag", "/about").',
    validation: (Rule) =>
      Rule.required()
        .regex(/^\/[a-zA-Z0-9\-_/]*$/, { name: 'relative path', invert: false })
        .error('Must be a valid relative path starting with "/"'),
  }),
  defineField({
    name: 'reviewDate',
    title: 'Content Review Date',
    type: 'date',
    group: 'rag',
    description: 'Date content was verified for accuracy and freshness.',
    options: {
      dateFormat: 'YYYY-MM-DD',
    },
  }),
  defineField({
    name: 'publishStatus',
    title: 'Publish Status',
    type: 'string',
    group: 'rag',
    description: 'Operational status of the document.',
    options: {
      list: [
        { title: 'Published', value: 'published' },
        { title: 'Draft', value: 'draft' },
        { title: 'Archived', value: 'archived' },
      ],
      layout: 'radio',
    },
    initialValue: 'published',
    validation: (Rule) => Rule.required(),
  }),
];
