import { defineType, defineArrayMember } from 'sanity';

/**
 * Constrained Portable Text block content schema.
 * Adheres to AGENTS.md visual rules (restrained typography, no oversized headings, clean structured AST).
 */
export const blockContent = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Inline Code', value: 'code' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel'],
                  }).error('Must be a valid HTTP, HTTPS, or Mailto link'),
              },
              {
                title: 'Open in new tab',
                name: 'blank',
                type: 'boolean',
                initialValue: true,
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Required for accessibility and screen readers.',
          validation: (Rule) => Rule.required().error('Alternative text is required for images.'),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineArrayMember({
      name: 'codeBlock',
      title: 'Code Block',
      type: 'object',
      fields: [
        {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              { title: 'TypeScript / JavaScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'Bash / Shell', value: 'bash' },
              { title: 'SQL', value: 'sql' },
              { title: 'JSON / YAML', value: 'yaml' },
              { title: 'GraphQL / GROQ', value: 'graphql' },
            ],
          },
          initialValue: 'typescript',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'filename',
          title: 'Filename / Label',
          type: 'string',
          description: 'Optional file path or descriptive snippet label (e.g. "api/routes/rag.py").',
        },
        {
          name: 'code',
          title: 'Code',
          type: 'text',
          rows: 8,
          validation: (Rule) => Rule.required().error('Code content cannot be empty.'),
        },
      ],
    }),
    defineArrayMember({
      name: 'callout',
      title: 'Callout Note',
      type: 'object',
      fields: [
        {
          name: 'tone',
          title: 'Callout Tone',
          type: 'string',
          options: {
            list: [
              { title: 'Note / Informational', value: 'info' },
              { title: 'Important / Caveat', value: 'warning' },
              { title: 'Tip / Best Practice', value: 'tip' },
            ],
          },
          initialValue: 'info',
        },
        {
          name: 'text',
          title: 'Message',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
  ],
});
