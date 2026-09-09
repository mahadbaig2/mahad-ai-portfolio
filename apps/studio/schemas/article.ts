import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const article = defineType({
  name: 'article',
  title: 'Article / Engineering Post',
  type: 'document',
  groups: [
    { name: 'main', title: 'Post Details', default: true },
    { name: 'body', title: 'Content Body' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().max(120).error('Title is required (max 120 chars).'),
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
      validation: (Rule) => Rule.required().error('Slug is required.'),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      group: 'main',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Estimated Reading Time (minutes)',
      type: 'number',
      group: 'main',
      initialValue: 5,
      validation: (Rule) => Rule.min(1).max(60),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'External Canonical URL (e.g., Medium)',
      type: 'url',
      group: 'main',
      description: 'Link to original publication if cross-posted from Medium or Substack.',
    }),
    defineField({
      name: 'tags',
      title: 'Topic Tags',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt / Summary',
      type: 'text',
      group: 'main',
      rows: 3,
      validation: (Rule) => Rule.required().min(20).max(350).error('Excerpt is required (20-350 chars).'),
    }),
    defineField({
      name: 'heroImage',
      title: 'Cover Image',
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
      name: 'body',
      title: 'Article Body',
      type: 'blockContent',
      group: 'body',
      validation: (Rule) => Rule.required().error('Article body cannot be empty.'),
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt',
      media: 'heroImage',
    },
    prepare({ title, date, media }) {
      return {
        title: title || 'Untitled Article',
        subtitle: date ? new Date(date).toLocaleDateString() : 'Draft',
        media,
      };
    },
  },
});
