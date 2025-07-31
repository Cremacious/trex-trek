import { getStravaAuthUrl } from '@/lib/actions/strava.actions';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET() {
  try {
    // Get the current user before redirecting to Strava
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in?error=not_authenticated'));
    }

    // Get the Strava auth URL
    const authUrl = getStravaAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error getting user for Strava auth:', error);
    return NextResponse.redirect(new URL('/sign-in?error=auth_failed'));
  }
}
