import SyncStravaButton from "@/components/SyncStravaButton";

export default function SyncStravaPage() {
  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
      <h1 className="text-2xl font-bold">Sync Your Strava Data</h1>
      <p>Connect your Strava account to sync your data.</p>
       <SyncStravaButton />
    </main>
  );
}
