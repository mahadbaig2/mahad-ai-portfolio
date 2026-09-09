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
      validation: (Rule) => Rule.required(),
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
    },
    prepare({ degree, institution, year }) {
      return {
        title: degree ? `${degree} - ${institution}` : institution,
        subtitle: year ? `Class of ${year}` : '',
      };
    },
  },
});
