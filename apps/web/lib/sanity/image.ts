import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { projectId, dataset } from './client';

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || 'placeholder-project-id',
  dataset: dataset || 'production',
});

/**
 * Helper to build responsive, auto-formatted Sanity asset URLs.
 */
export function urlForImage(source: SanityImageSource) {
  return imageBuilder.image(source).auto('format').fit('max');
}
