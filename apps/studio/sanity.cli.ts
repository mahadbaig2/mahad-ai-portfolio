import { defineCliConfig } from 'sanity/cli';
import path from 'node:path';
import fs from 'node:fs';

// Load .env from studio or root workspace
const envFiles = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  'rnjj6f7w';

const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  'production';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  vite: (config: any) => ({
    ...config,
    envDir: path.resolve(__dirname, '../../'),
    envPrefix: ['SANITY_STUDIO_', 'VITE_', 'NEXT_PUBLIC_'],
  }),
});

