import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const experience = defineType({
  name: 'experience',
  title: 'Work Experience',
  type: 'document',
  groups: [
    { name: 'main', title: 'Role & Organization', default: true },
    { name: 'impact', title: 'Achievements & Tech' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'company',
      title: 'Company / Organization',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Job Title / Role',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'employmentType',
      title: 'Employment Type',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Full-time', value: 'full_time' },
          { title: 'Contract / Freelance', value: 'contract' },
          { title: 'Part-time', value: 'part_time' },
        ],
      },
      initialValue: 'full_time',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      group: 'main',
      options: { dateFormat: 'YYYY-MM' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      group: 'main',
      options: { dateFormat: 'YYYY-MM' },
      hidden: ({ document }) => !!document?.isCurrent,
    }),
    defineField({
      name: 'isCurrent',
      title: 'Currently Working Here',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'main',
      initialValue: 'Remote',
    }),
    defineField({
      name: 'summary',
      title: 'Role Summary',
      type: 'text',
      group: 'main',
      rows: 3,
      validation: (Rule) => Rule.required().min(20).max(400),
    }),
    defineField({
      name: 'highlights',
      title: 'Key Achievements & Engineering Impact',
      type: 'array',
      group: 'impact',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(1).error('Provide at least one measurable achievement.'),
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      group: 'impact',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      role: 'role',
      company: 'company',
      start: 'startDate',
      isCurrent: 'isCurrent',
      end: 'endDate',
    },
    prepare({ role, company, start, isCurrent, end }) {
      const dateRange = `${start || ''} — ${isCurrent ? 'Present' : end || ''}`;
      return {
        title: `${role} at ${company}`,
        subtitle: dateRange,
      };
    },
  },
});
