'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/amplify-client';
import { getUserId, isOwnedBy } from '@/lib/current-user';
import { extractUserId, getDisplayName } from '@/lib/profile';
import type { Schema } from '@/amplify/data/resource';

type Comment = Schema['Comment']['type'];

export default function CommentSection({ entryId }: { entryId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUserId().then(setUserId);
    const sub = client.models.Comment.observeQuery({
      filter: { entryId: { eq: entryId } },
    }).subscribe({
      next: ({ items }) => {
        const sorted = [...items].sort((a, b) =>
          (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
        );
        setComments(sorted);
      },
    });
    return () => sub.unsubscribe();
  }, [entryId]);

  useEffect(() => {
    const uids = Array.from(
      new Set(comments.map((c) => (c.owner ? extractUserId(c.owner) : null)).filter(Boolean)),
    ) as string[];
    const unresolved = uids.filter((uid) => !(uid in names));
    if (unresolved.length === 0) return;
    unresolved.forEach((uid) => {
      getDisplayName(uid).then((displayName) => {
        setNames((prev) => ({ ...prev, [uid]: displayName }));
      });
    });
    // namesを依存に入れると解決の度に再実行されてしまうため、commentsのみで判定する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    await client.models.Comment.create({ entryId, body: body.trim() });
    setBody('');
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('このコメントを削除しますか?')) return;
    await client.models.Comment.delete({ id });
  }

  return (
    <section className="border-t border-black/10 pt-4 dark:border-white/10">
      <h2 className="text-lg font-semibold">コメント</h2>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md border border-black/20 px-3 py-2 text-sm dark:border-white/20"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          送信
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-black/60 dark:text-white/60">まだコメントがありません。</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {comments.map((c) => {
            const uid = c.owner ? extractUserId(c.owner) : null;
            return (
              <li key={c.id} className="rounded-md border border-black/10 p-3 dark:border-white/20">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{uid ? names[uid] ?? uid : '不明'}</span>
                  {userId && isOwnedBy(c.owner, userId) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="shrink-0 text-xs text-red-600"
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
