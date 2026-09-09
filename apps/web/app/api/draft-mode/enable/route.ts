import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * Enables Next.js draft mode for live preview from Sanity Studio
 * without exposing server write tokens to client bundles.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '/';

  const expectedSecret =
    process.env.SANITY_PREVIEW_SECRET ||
    process.env.SANITY_WEBHOOK_SECRET ||
    process.env.SANITY_API_READ_TOKEN ||
    'preview';

  if (secret !== expectedSecret) {
    return new Response('Invalid preview secret token', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(slug.startsWith('/') ? slug : `/${slug}`);
}
