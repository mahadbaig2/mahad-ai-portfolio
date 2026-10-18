import { defineType, defineField } from 'sanity';
import { ragMetadataFields } from './ragMetadata';

export const travelJourney = defineType({
  name: 'travelJourney',
  title: 'Travel Journey & Expedition',
  type: 'document',
  groups: [
    { name: 'main', title: 'Journey Details', default: true },
    { name: 'route', title: 'Route & Geography' },
    { name: 'story', title: 'Story & Field Notes' },
    { name: 'gallery', title: 'Photo Gallery' },
    { name: 'rag', title: 'RAG & AI Indexing' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Journey Title',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / Tagline',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      group: 'main',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Cover Image',
      type: 'image',
      group: 'main',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Journey',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    defineField({
      name: 'featuredRank',
      title: 'Featured Rank',
      type: 'number',
      group: 'main',
    }),
    defineField({
      name: 'journeyStatus',
      title: 'Journey Status',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Completed Expedition', value: 'completed' },
          { title: 'Draft / Unverified Details', value: 'draft' },
          { title: 'Planned Route', value: 'planned' },
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'origin',
      title: 'Origin',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'region',
      title: 'Region / Mountain Range',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      group: 'route',
      initialValue: 'Pakistan',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date (Only if verified)',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date (Only if verified)',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'yearLabel',
      title: 'Year Label',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'transportMode',
      title: 'Transport Mode',
      type: 'string',
      group: 'route',
      initialValue: 'Motorcycle Touring',
    }),
    defineField({
      name: 'motorcycle',
      title: 'Motorcycle / Hardware (Only if verified)',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'elevation',
      title: 'Peak Elevation',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'distance',
      title: 'Total Distance (Only if verified)',
      type: 'string',
      group: 'route',
    }),
    defineField({
      name: 'routeSummary',
      title: 'Route Summary',
      type: 'text',
      group: 'route',
      rows: 2,
    }),
    defineField({
      name: 'story',
      title: 'Story / Narrative Field Notes',
      type: 'blockContent',
      group: 'story',
    }),
    defineField({
      name: 'challenges',
      title: 'Field Realities & Challenges',
      type: 'array',
      group: 'story',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'reflection',
      title: 'Personal Reflection',
      type: 'text',
      group: 'story',
      rows: 3,
    }),
    defineField({
      name: 'gallery',
      title: 'Documentary Gallery',
      type: 'array',
      group: 'gallery',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption / Location Note' },
            { name: 'location', type: 'string', title: 'Location' },
            {
              name: 'orientation',
              type: 'string',
              title: 'Orientation',
              options: {
                list: [
                  { title: 'Landscape', value: 'landscape' },
                  { title: 'Portrait', value: 'portrait' },
                  { title: 'Panoramic', value: 'panoramic' },
                ],
              },
              initialValue: 'landscape',
            },
            { name: 'featured', type: 'boolean', title: 'Featured in Grid', initialValue: false },
          ],
        },
      ],
    }),
    ...ragMetadataFields,
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'destination',
      media: 'heroImage',
    },
  },
});
