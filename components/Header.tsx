'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getUserId } from '@/lib/current-user';

export default function Header() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) getUserId().then(setUserId);
  }, [user]);

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/trips" className="text-lg font-semibold">
            旅行記録アプリ
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/feed" className="hover:underline">
              みんなの記録
            </Link>
            <Link href="/favorites" className="hover:underline">
              お気に入り
            </Link>
            {userId && (
              <Link href={`/users/${userId}`} className="hover:underline">
                マイページ
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user && (
            <span className="text-black/60 dark:text-white/60">
              {user.signInDetails?.loginId}
            </span>
          )}
          <button
            onClick={signOut}
            className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
