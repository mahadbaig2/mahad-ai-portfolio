import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { projectId, dataset } from './client';

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || 'placeholder-project-id',
  dataset: dataset || 'production',
});

/**
 * Helper to build responsive, auto-formatted Sanity asset URLs.
 * Gracefully returns null if the image source lacks a valid asset or reference.
 */
export function urlForImage(source: SanityImageSource | null | undefined) {
  if (!source) return null;

  if (typeof source === 'object') {
    const src = source as Record<string, unknown>;
    // Require either .asset or ._ref or string
    if (!src.asset && !src._ref) {
      return null;
    }
  }

  try {
    return imageBuilder.image(source).auto('format').fit('max');
  } catch {
    return null;
  }
}
