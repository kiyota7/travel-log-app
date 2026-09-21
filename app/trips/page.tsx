'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { client } from '@/lib/amplify-client';
import { getOwnerIdentity } from '@/lib/current-user';
import TripCard from '@/components/TripCard';
import type { Schema } from '@/amplify/data/resource';

type Trip = Schema['Trip']['type'];

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let sub: { unsubscribe: () => void } | undefined;
    let active = true;

    getOwnerIdentity().then((owner) => {
      if (!active) return;
      // Trip/Entryはauthenticated()にも読み取りを許可しているため、
      // filter無しだと他ユーザーの旅行まで混ざってしまう。自分のものだけに絞る。
      sub = client.models.Trip.observeQuery({
        filter: { owner: { eq: owner } },
      }).subscribe({
        next: ({ items }) => {
          setTrips([...items]);
          setLoading(false);
        },
        error: () => {
          setError('旅行一覧の取得に失敗しました。');
          setLoading(false);
        },
      });
    });

    return () => {
      active = false;
      sub?.unsubscribe();
    };
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">旅行一覧</h1>
        <Link
          href="/trips/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          + 新しい旅行を作成
        </Link>
      </div>

      {loading && <p className="text-sm text-black/60 dark:text-white/60">読み込み中...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && trips.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          まだ旅行が登録されていません。「+ 新しい旅行を作成」から始めましょう。
        </p>
      )}

      <div className="flex flex-col gap-3">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
