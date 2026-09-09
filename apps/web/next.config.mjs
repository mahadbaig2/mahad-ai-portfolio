import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In a monorepo, ensure the root .env is loaded if apps/web is run independently
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(rootEnvPath);
  } catch (err) {
    // Ignore if already loaded or partially parsed
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'rnjj6f7w',
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SANITY_API_VERSION:
      process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-01',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
