import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  groups: [
    { name: 'main', title: 'Overview', default: true },
    { name: 'technical', title: 'Technical Architecture' },
    { name: 'evaluation', title: 'Evaluation & Trade-offs' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Case Study Title',
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
      validation: (Rule) => Rule.required().error('Slug is required.'),
    }),
    defineField({
      name: 'project',
      title: 'Associated Project',
      type: 'reference',
      to: [{ type: 'project' }],
      group: 'main',
      validation: (Rule) => Rule.required().error('Case study must reference a parent Project.'),
    }),
    defineField({
      name: 'summary',
      title: 'Executive Summary',
      type: 'text',
      group: 'main',
      rows: 3,
      validation: (Rule) => Rule.required().min(30).max(500),
    }),
    defineField({
      name: 'contextAndProblem',
      title: 'Context & Problem Statement',
      type: 'blockContent',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'engineeringApproach',
      title: 'Engineering Approach & Architecture',
      type: 'blockContent',
      group: 'technical',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'quantitativeResults',
      title: 'Quantitative Results & Benchmarks',
      type: 'array',
      group: 'evaluation',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'metric', title: 'Metric', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'result', title: 'Result', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'baseline', title: 'Baseline / Prior State', type: 'string' },
            { name: 'methodology', title: 'Measurement Methodology', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'tradeOffsAndFailures',
      title: 'Engineering Trade-offs & Unsuccessful Experiments',
      type: 'blockContent',
      group: 'evaluation',
      description: 'Honest evaluation of what was discarded, failed experiments, and conscious architectural compromises.',
    }),
    defineField({
      name: 'lessonsLearned',
      title: 'Key Takeaways & Lessons Learned',
      type: 'array',
      group: 'evaluation',
      of: [{ type: 'string' }],
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'title',
      projectTitle: 'project.title',
    },
    prepare({ title, projectTitle }) {
      return {
        title: title || 'Untitled Case Study',
        subtitle: projectTitle ? `Project: ${projectTitle}` : 'No project linked',
      };
    },
  },
});
