'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUrl } from 'aws-amplify/storage';
import { client } from '@/lib/amplify-client';
import { extractUserId, getDisplayName } from '@/lib/profile';
import type { Schema } from '@/amplify/data/resource';

type Entry = Schema['Entry']['type'];

function FeedItem({ entry }: { entry: Entry }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const authorId = entry.owner ? extractUserId(entry.owner) : null;

  useEffect(() => {
    if (!entry.photoKey) return;
    let active = true;
    getUrl({ path: entry.photoKey }).then(({ url }) => {
      if (active) setPhotoUrl(url.toString());
    });
    return () => {
      active = false;
    };
  }, [entry.photoKey]);

  useEffect(() => {
    if (!authorId) return;
    let active = true;
    getDisplayName(authorId).then((name) => {
      if (active) setAuthorName(name);
    });
    return () => {
      active = false;
    };
  }, [authorId]);

  useEffect(() => {
    const sub = client.models.Like.observeQuery({
      filter: { entryId: { eq: entry.id } },
    }).subscribe({
      next: ({ items }) => setLikeCount(items.length),
    });
    return () => sub.unsubscribe();
  }, [entry.id]);

  return (
    <Link
      href={`/trips/${entry.tripId}/entries/${entry.id}`}
      className="flex gap-3 rounded-lg border border-black/10 p-3 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
    >
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- S3の署名付きURLはドメインが動的なためnext/imageのremotePatternsで扱いづらく、単純なimgタグで表示する
        <img
          src={photoUrl}
          alt={entry.placeName}
          className="h-20 w-20 shrink-0 rounded object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-black/60 dark:text-white/60">{authorName ?? authorId}</p>
        <h3 className="font-medium">{entry.placeName}</h3>
        {entry.memo && (
          <p className="mt-1 line-clamp-2 text-sm text-black/70 dark:text-white/70">
            {entry.memo}
          </p>
        )}
        <p className="mt-1 text-xs text-black/60 dark:text-white/60">
          ♥ {likeCount}
        </p>
      </div>
    </Link>
  );
}

export default function FeedPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = client.models.Entry.observeQuery({
      filter: { isPublic: { eq: true } },
    }).subscribe({
      next: ({ items }) => {
        const sorted = [...items].sort((a, b) =>
          (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
        );
        setEntries(sorted);
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">みんなの記録</h1>
      {loading ? (
        <p className="text-sm text-black/60 dark:text-white/60">読み込み中...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          まだ公開されている記録がありません。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <FeedItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
