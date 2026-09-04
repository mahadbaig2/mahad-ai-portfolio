import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const styleExample = defineType({
  name: 'styleExample',
  title: 'Voice & Style Exemplar',
  type: 'document',
  groups: [
    { name: 'main', title: 'Example Info', default: true },
    { name: 'exchange', title: 'Prompt & Response' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Exemplar Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Roman Urdu', value: 'roman_urdu' },
        ],
        layout: 'radio',
      },
      initialValue: 'en',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'scenario',
      title: 'Scenario / Intent Category',
      type: 'string',
      group: 'main',
      description: 'E.g., "Architecture trade-off explanation", "Polite out-of-scope refusal", "Roman Urdu greeting".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userPrompt',
      title: 'Sample User Prompt',
      type: 'string',
      group: 'exchange',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'assistantResponse',
      title: 'Canonical Assistant Response',
      type: 'text',
      group: 'exchange',
      rows: 5,
      description: 'Target response exhibiting Mahad’s communication style: grounded, concise, professional, zero corporate fluff.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'toneNotes',
      title: 'Style & Tone Notes',
      type: 'text',
      group: 'exchange',
      rows: 3,
      description: 'Why this response is ideal; key behavioral rules demonstrated.',
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'title',
      lang: 'language',
      scenario: 'scenario',
    },
    prepare({ title, lang, scenario }) {
      return {
        title,
        subtitle: `[${lang === 'roman_urdu' ? 'Roman Urdu' : 'English'}] ${scenario || ''}`,
      };
    },
  },
});
