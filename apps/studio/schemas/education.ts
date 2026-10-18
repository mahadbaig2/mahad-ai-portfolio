import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const education = defineType({
  name: 'education',
  title: 'Education & Certifications',
  type: 'document',
  groups: [
    { name: 'main', title: 'Details', default: true },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'institution',
      title: 'Institution / University / Provider',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'degree',
      title: 'Degree or Certification',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'recordType',
      title: 'Record Type',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Degree', value: 'degree' },
          { title: 'Certification', value: 'certification' },
          { title: 'Ongoing Program', value: 'ongoing' },
          { title: 'Bootcamp', value: 'bootcamp' },
          { title: 'Short Course', value: 'short_course' },
        ],
      },
      initialValue: 'degree',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Completed', value: 'completed' },
          { title: 'In Progress / Ongoing', value: 'ongoing' },
        ],
      },
      initialValue: 'completed',
    }),
    defineField({
      name: 'completionLabel',
      title: 'Display Completion Label (e.g., "Completed 2024", "Expected 2025")',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'fieldOfStudy',
      title: 'Field of Study / Specialization',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'graduationYear',
      title: 'Graduation / Completion Year',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'credentialUrl',
      title: 'Verification / Credential URL',
      type: 'url',
      group: 'main',
    }),
    defineField({
      name: 'highlights',
      title: 'Key Coursework, Honors or Projects',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      degree: 'degree',
      institution: 'institution',
      year: 'graduationYear',
      label: 'completionLabel',
      type: 'recordType',
    },
    prepare({ degree, institution, year, label, type }) {
      const sub = label || (year && year.toLowerCase() !== 'completed' ? `Year: ${year}` : type || '');
      return {
        title: degree ? `${degree} - ${institution}` : institution,
        subtitle: sub,
      };
    },
  },
});

