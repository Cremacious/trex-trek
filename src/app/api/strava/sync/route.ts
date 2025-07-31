import { getStravaActivities } from '@/lib/actions/strava.actions';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Activity, StravaActivity } from '@/lib/types/activity.type';

export async function POST(request: NextRequest) {
  const { accessToken, userId } = await request.json();

  const activitiesRaw: StravaActivity[] = await getStravaActivities(
    accessToken
  );
  const activities: Activity[] = activitiesRaw.map((act) => ({
    id: act.id?.toString() ?? '',
    userId,
    resourceState: act.resource_state ?? 2,
    athleteId: act.athlete?.id ?? undefined,
    athleteResourceState: act.athlete?.resource_state ?? undefined,
    name: act.name ?? '',
    distance: act.distance ?? 0,
    movingTime: act.moving_time ?? 0,
    elapsedTime: act.elapsed_time ?? 0,
    totalElevationGain: act.total_elevation_gain ?? 0,
    type: act.type ?? '',
    sportType: act.sport_type ?? '',
    workoutType: act.workout_type ?? null,
    startDate: act.start_date ?? '',
    startDateLocal: act.start_date_local ?? '',
    timezone: '', 
    utcOffset: 0, 
    locationCity: act.location_city ?? '',
    locationState: act.location_state ?? '',
    locationCountry: act.location_country ?? '',
    achievementCount: act.achievement_count ?? 0,
    kudosCount: act.kudos_count ?? 0,
    commentCount: act.comment_count ?? 0,
    athleteCount: act.athlete_count ?? 1,
    photoCount: act.photo_count ?? 0,
    mapId: act.map?.id ?? '',
    summaryPolyline: act.map?.summary_polyline ?? '',
    mapResourceState: act.map?.resource_state ?? undefined,
    trainer: act.trainer ?? false,
    commute: act.commute ?? false,
    manual: act.manual ?? false,
    private: act.private ?? false,
    visibility: act.visibility ?? '',
    flagged: act.flagged ?? false,
    gearId: act.gear_id ?? '',
    startLat: act.start_latlng?.[0] ?? undefined,
    startLng: act.start_latlng?.[1] ?? undefined,
    endLat: act.end_latlng?.[0] ?? undefined,
    endLng: act.end_latlng?.[1] ?? undefined,
    averageSpeed: act.average_speed ?? 0,
    maxSpeed: act.max_speed ?? 0,
    hasHeartrate: act.has_heartrate ?? false,
    averageHeartrate: act.average_heartrate ?? null,
    maxHeartrate: act.max_heartrate ?? null,
    heartrateOptOut: act.heartrate_opt_out ?? false,
    displayHideHeartrateOption: act.display_hide_heartrate_option ?? false,
    elevHigh: act.elev_high ?? undefined,
    elevLow: act.elev_low ?? undefined,
    uploadId: act.upload_id ?? null,
    uploadIdStr: act.upload_id_str ?? '',
    externalId: act.external_id ?? '',
    fromAcceptedTag: act.from_accepted_tag ?? false,
    prCount: act.pr_count ?? 0,
    totalPhotoCount: act.total_photo_count ?? 0,
    hasKudoed: act.has_kudoed ?? false,
    createdAt: act.created_at ?? '',
    updatedAt: act.updated_at ?? '',
    map: act.map ?? {},
  }));

  const latest = await prisma.activity.findFirst({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });

  const newActivities = latest
    ? activities.filter((a) => {
        if (!a.startDate || isNaN(new Date(a.startDate).getTime()))
          return false;
        return new Date(a.startDate) > latest.startDate;
      })
    : activities;

  console.log(
    `Syncing ${newActivities.length} new activities for user ${userId}`
  );
  let synced = 0;
  for (const act of newActivities) {
    if (
      !act.startDate ||
      isNaN(new Date(act.startDate).getTime()) ||
      !act.startDateLocal ||
      isNaN(new Date(act.startDateLocal).getTime()) ||
      act.movingTime === undefined ||
      act.elapsedTime === undefined ||
      !act.sportType
    ) {
      console.log('Skipping activity due to missing/invalid fields:', act);
      continue;
    }

    try {
      await prisma.activity.upsert({
        where: { id_userId: { id: act.id.toString(), userId } },
        update: {
          name: act.name,
          distance: act.distance,
        },
        create: {
          id: act.id.toString(),
          userId,
          name: act.name,
          distance: act.distance,
          movingTime: act.movingTime,

          elapsedTime: act.elapsedTime,
          type: act.type,
          sportType: act.sportType,
          startDate: new Date(act.startDate),
          startDateLocal: new Date(act.startDateLocal),
          timezone: act.timezone,
          utcOffset: act.utcOffset,
          averageSpeed: act.averageSpeed,
          maxSpeed: act.maxSpeed,
          totalElevationGain: act.totalElevationGain ?? 0,
          mapId: act.map?.id,
          summaryPolyline: act.map?.summary_polyline,
          resourceState: act.resourceState ?? 2,
          achievementCount: act.achievementCount ?? 0,
          kudosCount: act.kudosCount ?? 0,
          commentCount: act.commentCount ?? 0,
          athleteCount: act.athleteCount ?? 1,
          externalId: act.externalId ?? '',
          uploadId:
            act.uploadId != null
              ? typeof act.uploadId === 'string'
                ? Number(act.uploadId)
                : act.uploadId
              : null,
          startLat: act.startLat,
          endLat: act.endLat,
          locationCity: act.locationCity ?? '',
          locationState: act.locationState ?? '',
          locationCountry: act.locationCountry ?? '',
          photoCount: act.photoCount ?? 0,
          trainer: act.trainer ?? false,
          commute: act.commute ?? false,
          manual: act.manual ?? false,
          private: act.private ?? false,
          flagged: act.flagged ?? false,
          workoutType: act.workoutType ?? null,
          hasHeartrate: act.hasHeartrate ?? false,
          averageHeartrate: act.averageHeartrate ?? null,
          maxHeartrate: act.maxHeartrate ?? null,
          heartrateOptOut: act.heartrateOptOut ?? false,
          displayHideHeartrateOption: act.displayHideHeartrateOption ?? false,
          fromAcceptedTag: act.fromAcceptedTag ?? false,
          prCount: act.prCount ?? 0,
          totalPhotoCount: act.totalPhotoCount ?? 0,
          hasKudoed: act.hasKudoed ?? false,
        },
      });
      synced++;
    } catch (err) {
      console.log(`Failed to sync activity ${act.id}:`, err);
      continue;
    }
  }

  return NextResponse.json({ synced });
}
