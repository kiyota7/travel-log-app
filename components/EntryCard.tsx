'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';

type Entry = Schema['Entry']['type'];

export default function EntryCard({
  entry,
  onDelete,
}: {
  entry: Entry;
  onDelete?: (id: string) => void;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium">{entry.placeName}</h3>
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="shrink-0 text-sm text-red-600"
            >
              削除
            </button>
          )}
        </div>
        {entry.visitedDate && (
          <p className="text-xs text-black/60 dark:text-white/60">{entry.visitedDate}</p>
        )}
        {entry.memo && <p className="mt-1 whitespace-pre-wrap text-sm">{entry.memo}</p>}
      </div>
    </Link>
  );
}
