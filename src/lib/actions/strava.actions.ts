const STRAVA_CLIENT_ID = process.env.CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.CLIENT_SECRET!;
const BASE_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000';
const REDIRECT_URI = `${BASE_URL}/api/strava/callback`;

export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'read,activity:read_all',
    approval_prompt: 'auto',
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
}

export async function getStravaActivities(accessToken: string) {
  const res = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}
