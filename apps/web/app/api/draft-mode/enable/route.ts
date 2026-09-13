import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const dynamic = 'force-static';

/**
 * Next.js draft mode endpoint.
 * In static export mode, returns a static notice.
 */
export async function GET() {
  return new Response('Draft mode is unavailable in static export', { status: 200 });
}
