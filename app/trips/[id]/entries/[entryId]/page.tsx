'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getUrl } from 'aws-amplify/storage';
import { client } from '@/lib/amplify-client';
import { getUserId, isOwnedBy } from '@/lib/current-user';
import TripMap from '@/components/TripMap';
import LikeButton from '@/components/LikeButton';
import FavoriteButton from '@/components/FavoriteButton';
import CommentSection from '@/components/CommentSection';
import type { Schema } from '@/amplify/data/resource';

type Entry = Schema['Entry']['type'];

export default function EntryDetailPage() {
  const { id: tripId, entryId } = useParams<{ id: string; entryId: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([client.models.Entry.get({ id: entryId }), getUserId()]).then(
      ([{ data, errors }, uid]) => {
        if (!active) return;
        setUserId(uid);
        if (errors || !data) {
          setError('記録が見つかりませんでした。');
        } else {
          setEntry(data);
        }
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [entryId]);

  useEffect(() => {
    if (!entry?.photoKey) return;
    let active = true;
    getUrl({ path: entry.photoKey }).then(({ url }) => {
      if (active) setPhotoUrl(url.toString());
    });
    return () => {
      active = false;
    };
  }, [entry?.photoKey]);

  if (loading) return <p className="text-sm text-black/60 dark:text-white/60">読み込み中...</p>;
  if (error || !entry) {
    return <p className="text-sm text-red-600">{error ?? '記録が見つかりませんでした。'}</p>;
  }

  const isOwner = !!userId && isOwnedBy(entry.owner, userId);
  if (!isOwner && !entry.isPublic) {
    return <p className="text-sm text-red-600">この記録は非公開です。</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/trips/${tripId}`}
        className="text-sm text-black/60 hover:underline dark:text-white/60"
      >
        ← 旅行に戻る
      </Link>

      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- S3の署名付きURLはドメインが動的なためnext/imageのremotePatternsで扱いづらく、単純なimgタグで表示する
        <img
          src={photoUrl}
          alt={entry.placeName}
          className="max-h-96 w-full rounded-lg object-cover"
        />
      )}

      <div>
        <h1 className="text-xl font-bold">{entry.placeName}</h1>
        {entry.visitedDate && (
          <p className="text-sm text-black/60 dark:text-white/60">{entry.visitedDate}</p>
        )}
        {entry.memo && <p className="mt-2 whitespace-pre-wrap">{entry.memo}</p>}
      </div>

      {entry.lat != null && entry.lng != null && <TripMap entries={[entry]} />}

      <div className="flex items-center gap-3">
        <LikeButton entryId={entry.id} />
        <FavoriteButton entryId={entry.id} />
      </div>

      <CommentSection entryId={entry.id} />
    </div>
  );
}
