import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { deskStructure } from './structure/deskStructure';

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  'placeholder-project-id';

const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  'production';

export default defineConfig({
  name: 'default',
  title: "Mahad's Portfolio Studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
