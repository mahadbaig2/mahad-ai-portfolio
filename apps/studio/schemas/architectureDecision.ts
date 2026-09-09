import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const architectureDecision = defineType({
  name: 'architectureDecision',
  title: 'Architecture Decision Record (ADR)',
  type: 'document',
  groups: [
    { name: 'main', title: 'Decision Overview', default: true },
    { name: 'details', title: 'Context & Consequences' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'decisionNumber',
      title: 'ADR Number',
      type: 'number',
      group: 'main',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'title',
      title: 'ADR Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Accepted for V1', value: 'accepted' },
          { title: 'Proposed', value: 'proposed' },
          { title: 'Superseded', value: 'superseded' },
          { title: 'Deprecated', value: 'deprecated' },
        ],
      },
      initialValue: 'accepted',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Decision Date',
      type: 'date',
      group: 'main',
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'context',
      title: 'Context & Problem Statement',
      type: 'text',
      group: 'details',
      rows: 4,
      validation: (Rule) => Rule.required().min(20),
    }),
    defineField({
      name: 'decision',
      title: 'The Decision',
      type: 'blockContent',
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'consequences',
      title: 'Consequences & Analysis',
      type: 'blockContent',
      group: 'details',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'positiveImpacts',
      title: 'Positive Impacts / Benefits',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tradeOffs',
      title: 'Trade-offs & Constraints',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      number: 'decisionNumber',
      title: 'title',
      status: 'status',
    },
    prepare({ number, title, status }) {
      const formattedNum = String(number || 0).padStart(4, '0');
      return {
        title: `ADR-${formattedNum}: ${title}`,
        subtitle: `Status: ${status || 'accepted'}`,
      };
    },
  },
});
