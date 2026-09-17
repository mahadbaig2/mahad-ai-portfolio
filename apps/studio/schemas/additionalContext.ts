import { defineType, defineField } from 'sanity';

/**
 * Additional Context — singleton document for CONTEXT.md style free-form narrative.
 *
 * Mahad writes his complete personal story here: design-to-engineering journey,
 * reasons for leaving each role, values, and anything the chatbot should know
 * that doesn't fit a structured schema.
 *
 * The ingestion pipeline reads contextText (preferred) and indexes it into RAG.
 * Webhook triggers automatic re-indexing whenever this document is published.
 */
export const additionalContext = defineType({
  name: 'additionalContext',
  title: 'Additional Context',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Document Title',
      type: 'string',
      initialValue: 'Additional Context',
      readOnly: true,
      description: 'This is a singleton document — there is only one.',
    }),
    defineField({
      name: 'ragEnabled',
      title: 'Index in RAG',
      type: 'boolean',
      initialValue: true,
      description: 'When enabled, this content is indexed into the vector store and used by the chatbot.',
    }),
    defineField({
      name: 'contextText',
      title: 'Context (Markdown)',
      type: 'text',
      rows: 30,
      description: `Write your complete personal narrative here in plain Markdown.
Include: who you are, your design-to-engineering journey, each role and why you left,
what you've built, what you stand for, how you think about problems, and anything
the chatbot should know to answer questions about you authentically.

This is indexed directly into RAG and cited by the assistant.`,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as { ragEnabled?: boolean };
          if (doc?.ragEnabled && (!value || (value as string).trim().length < 50)) {
            return 'Context must be at least 50 characters when RAG indexing is enabled.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description: 'Set this to the current time whenever you update the context (helps track freshness).',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'contextText',
    },
  },
});
