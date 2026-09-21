'use client';

import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { client } from '@/lib/amplify-client';

// サインイン後、自分のProfile(投稿者名として他ユーザーに表示される)が
// 無ければ自動作成する。表示画面は持たず、副作用のみのコンポーネント。
export default function ProfileBootstrap() {
  const { user } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    if (!user) return;
    const username = user.username;
    const email = user.signInDetails?.loginId ?? '';

    client.models.Profile.get({ id: username }).then(({ data }) => {
      if (data) return;
      const displayName = email.split('@')[0] || username;
      client.models.Profile.create({ id: username, displayName, email });
    });
  }, [user]);

  return null;
}
