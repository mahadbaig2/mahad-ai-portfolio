import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const dynamic = 'force-static';

/**
 * Disables Next.js draft mode.
 */
export async function GET() {
  return new Response('Draft mode is disabled in static export', { status: 200 });
}
