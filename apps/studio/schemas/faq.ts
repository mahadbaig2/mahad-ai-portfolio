import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const faq = defineType({
  name: 'faq',
  title: 'Frequently Asked Question (FAQ)',
  type: 'document',
  groups: [
    { name: 'main', title: 'Question & Answer', default: true },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().min(10).max(200),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'blockContent',
      group: 'main',
      validation: (Rule) => Rule.required().error('Answer is required.'),
    }),
    defineField({
      name: 'category',
      title: 'FAQ Category',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Career, Roles & Availability', value: 'career' },
          { title: 'AI Engineering Philosophy & Architecture', value: 'philosophy' },
          { title: 'Technology Stack & Systems Decisions', value: 'stack' },
          { title: 'Collaboration & Contact', value: 'contact' },
        ],
      },
      initialValue: 'career',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Display Priority / Order',
      type: 'number',
      group: 'main',
      initialValue: 10,
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'question',
      category: 'category',
    },
    prepare({ title, category }) {
      return {
        title,
        subtitle: `Category: ${category || 'General'}`,
      };
    },
  },
});
