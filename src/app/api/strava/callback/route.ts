import { exchangeCodeForToken } from '@/lib/actions/strava.actions';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(
      new URL('/sign-in?error=missing_code', url.origin)
    );
  }

  try {
    console.log('Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code);
    console.log('Token data received:', {
      hasAccessToken: !!tokenData.access_token,
      tokenType: typeof tokenData,
    });

    if (!tokenData || !tokenData.access_token) {
      console.error('Token exchange failed - no access token received');
      return NextResponse.redirect(
        new URL('/sign-in?error=token_failed', url.origin)
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      console.error('No authenticated user found');
      return NextResponse.redirect(
        new URL('/sign-in?error=no_user', url.origin)
      );
    }

    console.log('Calling sync API for user:', user.id);
    const syncResponse = await fetch(`${url.origin}/api/strava/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: tokenData.access_token,
        userId: user.id,
      }),
      cache: 'no-store',
    });

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.error('Sync API call failed:', syncResponse.status, errorText);
    }

    return NextResponse.redirect(new URL('/sync-strava', url.origin));
  } catch (error) {
    console.error('Strava token exchange failed:', error);
    return NextResponse.redirect(
      new URL('/sign-in?error=server_error', url.origin)
    );
  }
}
