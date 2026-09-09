import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const personalStory = defineType({
  name: 'personalStory',
  title: 'Personal Narrative & Story',
  type: 'document',
  groups: [
    { name: 'main', title: 'Story Info', default: true },
    { name: 'body', title: 'Content' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Story Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'topic',
      title: 'Topic / Theme',
      type: 'string',
      group: 'main',
      description: 'E.g., "Transition to AI Engineering", "Philosophy on Boring Technology", "Why RAG Grounding Matters".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Quick Summary',
      type: 'text',
      group: 'main',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'story',
      title: 'The Story / Narrative',
      type: 'blockContent',
      group: 'body',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tone',
      title: 'Narrative Tone',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Reflective & Authentic', value: 'reflective' },
          { title: 'Pragmatic & Technical', value: 'technical' },
          { title: 'Philosophical & Direct', value: 'direct' },
        ],
      },
      initialValue: 'pragmatic',
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'topic',
    },
  },
});
