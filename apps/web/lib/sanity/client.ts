import { createClient } from 'next-sanity';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-01';

/**
 * Returns true only if a valid, non-placeholder Sanity Project ID is provided.
 */
export function isSanityConfigured(): boolean {
  return (
    typeof projectId === 'string' &&
    projectId.trim().length > 0 &&
    projectId !== 'placeholder-project-id' &&
    projectId !== 'placeholder-id'
  );
}

export const client = isSanityConfigured()
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === 'production',
    })
  : null;

/**
 * Robust fetch wrapper around Sanity client.
 * Gracefully returns null on any error to allow calling functions to serve local fallbacks.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 60,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T | null> {
  if (!client || !isSanityConfigured()) {
    return null;
  }

  try {
    return await client.fetch<T>(query, params, {
      next: {
        revalidate: tags.length ? false : revalidate,
        tags,
      },
    });
  } catch (error) {
    console.warn(
      '[Sanity] Fetch failed, graceful fallback enabled:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}
