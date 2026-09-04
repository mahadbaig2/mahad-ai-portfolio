import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'main', title: 'Details', default: true },
    { name: 'content', title: 'Content & Metrics' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().max(100).error('Title is required (max 100 chars).'),
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
      validation: (Rule) => Rule.required().error('Slug is required to generate portfolio URL.'),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / One-line Summary',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().max(160).error('Subtitle is required (max 160 chars).'),
    }),
    defineField({
      name: 'clientOrOrg',
      title: 'Client / Organization',
      type: 'string',
      group: 'main',
      initialValue: 'Independent / Open Source',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      group: 'main',
      initialValue: '2025',
    }),
    defineField({
      name: 'role',
      title: 'Role / Focus',
      type: 'string',
      group: 'main',
      initialValue: 'AI Product Engineer',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: (Rule) => Rule.required().error('Alt text is required for accessibility.'),
        },
      ],
    }),
    defineField({
      name: 'overview',
      title: 'Project Overview',
      type: 'text',
      group: 'content',
      rows: 4,
      validation: (Rule) => Rule.required().min(20).max(600).error('Overview is required (20-600 characters).'),
    }),
    defineField({
      name: 'architectureDiagram',
      title: 'Architecture Diagram / Topology',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption / Architecture Summary',
        },
      ],
    }),
    defineField({
      name: 'metrics',
      title: 'Key Quantitative Results / Metrics',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Metric Label', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'value', title: 'Metric Value', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'context', title: 'Baseline / Context', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'keyDecisions',
      title: 'Key Technical Decisions',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'stack',
      title: 'Technology Stack',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live Demo URL',
      type: 'url',
      group: 'content',
    }),
    defineField({
      name: 'githubUrl',
      title: 'Source Code / Repository URL',
      type: 'url',
      group: 'content',
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'role',
      media: 'heroImage',
    },
  },
});
