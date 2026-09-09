import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * Disables Next.js draft mode.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '/';

  const draft = await draftMode();
  draft.disable();

  redirect(slug.startsWith('/') ? slug : `/${slug}`);
}
