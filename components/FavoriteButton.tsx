'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/amplify-client';

// Favoriteはallow.owner()のみの認可のため、filter無しのobserveQueryでも
// 自分の所有レコードだけが自動的に返る(list系操作もowner認可でスコープされる)。
export default function FavoriteButton({ entryId }: { entryId: string }) {
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sub = client.models.Favorite.observeQuery({
      filter: { entryId: { eq: entryId } },
    }).subscribe({
      next: ({ items }) => {
        setFavoriteId(items[0]?.id ?? null);
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, [entryId]);

  async function toggle() {
    if (busy || loading) return;
    setBusy(true);
    if (favoriteId) {
      await client.models.Favorite.delete({ id: favoriteId });
    } else {
      await client.models.Favorite.create({ entryId });
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || loading}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
        favoriteId
          ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950'
          : 'border-black/20 dark:border-white/20'
      }`}
    >
      <span>{favoriteId ? '★' : '☆'}</span>
      お気に入り
    </button>
  );
}
