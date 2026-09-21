'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/amplify-client';
import { getUserId, isOwnedBy } from '@/lib/current-user';
import type { Schema } from '@/amplify/data/resource';

type Like = Schema['Like']['type'];

export default function LikeButton({ entryId }: { entryId: string }) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getUserId().then(setUserId);
    const sub = client.models.Like.observeQuery({
      filter: { entryId: { eq: entryId } },
    }).subscribe({
      next: ({ items }) => setLikes([...items]),
    });
    return () => sub.unsubscribe();
  }, [entryId]);

  const myLike = userId ? likes.find((l) => isOwnedBy(l.owner, userId)) : undefined;

  async function toggle() {
    if (busy || !userId) return;
    setBusy(true);
    if (myLike) {
      await client.models.Like.delete({ id: myLike.id });
    } else {
      await client.models.Like.create({ entryId });
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || !userId}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
        myLike
          ? 'border-pink-300 bg-pink-50 text-pink-600 dark:border-pink-700 dark:bg-pink-950'
          : 'border-black/20 dark:border-white/20'
      }`}
    >
      <span>{myLike ? '♥' : '♡'}</span>
      いいね{likes.length > 0 ? ` ${likes.length}` : ''}
    </button>
  );
}
