import { exchangeCodeForToken } from '@/lib/actions/strava.actions';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/sign-in?error=missing_code', url.origin));
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    if (!tokenData || !tokenData.access_token) {
      return NextResponse.redirect(new URL('/sign-in?error=token_failed', url.origin));
    }

   
    const user = await getCurrentUser();
    if (user) {

      await fetch(`${url.origin}/api/strava/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: tokenData.access_token, userId: user.id }),
        cache: 'no-store',
      });
    }

 
    return NextResponse.redirect(new URL('/sync-strava', url.origin));
  } catch (error) {
    console.error('Strava token exchange failed:', error);
    return NextResponse.redirect(new URL('/sign-in?error=server_error', url.origin));
  }
}