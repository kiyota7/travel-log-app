'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import { ownerIdentityFor } from '@/lib/current-user';
import FollowButton from '@/components/FollowButton';
import TripCard from '@/components/TripCard';
import type { Schema } from '@/amplify/data/resource';

type Trip = Schema['Trip']['type'];

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    client.models.Profile.get({ id: userId }).then(({ data }) => {
      if (active) setDisplayName(data?.displayName ?? userId);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const followerSub = client.models.Follow.observeQuery({
      filter: { followingId: { eq: userId } },
    }).subscribe({
      next: ({ items }) => setFollowerCount(items.length),
    });
    const followingSub = client.models.Follow.observeQuery({
      filter: { owner: { eq: ownerIdentityFor(userId) } },
    }).subscribe({
      next: ({ items }) => setFollowingCount(items.length),
    });
    return () => {
      followerSub.unsubscribe();
      followingSub.unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    const sub = client.models.Trip.observeQuery({
      filter: { owner: { eq: ownerIdentityFor(userId) }, isPublic: { eq: true } },
    }).subscribe({
      next: ({ items }) => {
        setTrips([...items]);
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, [userId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{displayName ?? '読み込み中...'}</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            フォロワー {followerCount} ・ フォロー中 {followingCount}
          </p>
        </div>
        <FollowButton targetUserId={userId} />
      </div>

      <section>
        <h2 className="text-lg font-semibold">公開中の旅行</h2>
        {loading ? (
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">読み込み中...</p>
        ) : trips.length === 0 ? (
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            公開中の旅行はまだありません。
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
