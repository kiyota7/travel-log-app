'use client';

import Link from 'next/link';
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function Header() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/trips" className="text-lg font-semibold">
          旅行記録アプリ
        </Link>
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
