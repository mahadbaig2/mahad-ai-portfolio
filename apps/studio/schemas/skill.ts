import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const skill = defineType({
  name: 'skill',
  title: 'Technical Skill',
  type: 'document',
  groups: [
    { name: 'main', title: 'Skill Info', default: true },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Skill Name',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'AI & Machine Learning (RAG, LangGraph, ONNX, Embeddings)', value: 'ai_ml' },
          { title: 'Backend & Systems Engineering (FastAPI, Python, PostgreSQL)', value: 'backend' },
          { title: 'Frontend & Product Engineering (Next.js, TypeScript, React, Tailwind)', value: 'frontend' },
          { title: 'Data, Vector Stores & Cloud (Qdrant, Neon, Hugging Face, Docker)', value: 'cloud_data' },
          { title: 'Evaluation & LLMOps (LangSmith, MLflow, Vitest, Playwright)', value: 'llmops' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'proficiency',
      title: 'Proficiency Level',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Production Depth / Specialized', value: 'expert' },
          { title: 'Proficient / Daily Use', value: 'proficient' },
          { title: 'Working Knowledge', value: 'familiar' },
        ],
      },
      initialValue: 'expert',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Context & Production Usage',
      type: 'text',
      group: 'main',
      rows: 2,
      description: 'Brief description of where and how Mahad applies this skill in production systems.',
    }),
    defineField({
      name: 'featured',
      title: 'Feature on Homepage',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'name',
      category: 'category',
      level: 'proficiency',
    },
    prepare({ title, category, level }) {
      return {
        title,
        subtitle: `${category || ''} (${level || ''})`,
      };
    },
  },
});
