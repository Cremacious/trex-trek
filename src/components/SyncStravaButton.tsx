'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SyncStravaButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    window.location.href = '/api/strava/auth';
  };

  return (
    <div className="bg-orange-400 p-4 rounded-md text-center">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Syncing...' : 'Sync Strava To account'}
      </Button>
    </div>
  );
}
