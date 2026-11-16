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

// A static export embeds this value in browser JavaScript. Reject loopback
// addresses on hosted builds so production chat never silently targets a
// visitor's own computer.
if (process.env.PORTFOLIO_REQUIRE_PUBLIC_API_URL === '1') {
  let apiUrl;
  try {
    apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || '');
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL must be a public HTTPS API URL for deployment.');
  }
  if (apiUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(apiUrl.hostname)) {
    throw new Error('NEXT_PUBLIC_API_URL must be a public HTTPS API URL for deployment.');
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'rnjj6f7w',
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SANITY_API_VERSION:
      process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-01',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
