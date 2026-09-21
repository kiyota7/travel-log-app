'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/amplify-client';
import { getUserId, isOwnedBy } from '@/lib/current-user';
import type { Schema } from '@/amplify/data/resource';

type Follow = Schema['Follow']['type'];

export default function FollowButton({ targetUserId }: { targetUserId: string }) {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getUserId().then(setUserId);
    const sub = client.models.Follow.observeQuery({
      filter: { followingId: { eq: targetUserId } },
    }).subscribe({
      next: ({ items }) => setFollows([...items]),
    });
    return () => sub.unsubscribe();
  }, [targetUserId]);

  const myFollow = userId ? follows.find((f) => isOwnedBy(f.owner, userId)) : undefined;

  // 自分自身のプロフィールではフォローボタンを表示しない
  if (userId && userId === targetUserId) return null;

  async function toggle() {
    if (busy || !userId) return;
    setBusy(true);
    if (myFollow) {
      await client.models.Follow.delete({ id: myFollow.id });
    } else {
      await client.models.Follow.create({ followingId: targetUserId });
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || !userId}
      className={`rounded-md border px-4 py-1.5 text-sm ${
        myFollow
          ? 'border-black/20 dark:border-white/20'
          : 'border-transparent bg-foreground text-background'
      }`}
    >
      {myFollow ? 'フォロー中' : 'フォローする'}
    </button>
  );
}
