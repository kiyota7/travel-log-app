'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/amplify-client';
import EntryCard from '@/components/EntryCard';
import type { Schema } from '@/amplify/data/resource';

type Entry = Schema['Entry']['type'];

export default function FavoritesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = client.models.Favorite.observeQuery().subscribe({
      next: async ({ items }) => {
        const results = await Promise.all(
          items.map((fav) => client.models.Entry.get({ id: fav.entryId })),
        );
        const found = results.map((r) => r.data).filter((e) => e !== null);
        setEntries(found);
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">お気に入り</h1>
      {loading ? (
        <p className="text-sm text-black/60 dark:text-white/60">読み込み中...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          まだお気に入りに登録した記録がありません。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
