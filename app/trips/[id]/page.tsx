'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';
import TripMap from '@/components/TripMap';
import EntryCard from '@/components/EntryCard';
import type { Schema } from '@/amplify/data/resource';

type Trip = Schema['Trip']['type'];
type Entry = Schema['Entry']['type'];

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let active = true;
    client.models.Trip.get({ id }).then(({ data, errors }) => {
      if (!active) return;
      if (errors || !data) {
        setError('旅行が見つかりませんでした。');
      } else {
        setTrip(data);
        setForm({
          title: data.title,
          description: data.description ?? '',
          startDate: data.startDate ?? '',
          endDate: data.endDate ?? '',
        });
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const sub = client.models.Entry.observeQuery({
      filter: { tripId: { eq: id } },
    }).subscribe({
      next: ({ items }) => setEntries([...items]),
    });
    return () => sub.unsubscribe();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setSaving(true);
    const { data, errors } = await client.models.Trip.update({
      id: trip.id,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    });
    setSaving(false);
    if (errors || !data) {
      setError('更新に失敗しました。');
      return;
    }
    setTrip(data);
    setEditing(false);
  }

  async function handleDelete() {
    if (!trip) return;
    if (!confirm('この旅行を削除しますか?記録も含めて削除されます。')) return;
    await Promise.all(
      entries.map((entry) => client.models.Entry.delete({ id: entry.id })),
    );
    await client.models.Trip.delete({ id: trip.id });
    router.push('/trips');
  }

  async function handleDeleteEntry(entryId: string) {
    if (!confirm('この記録を削除しますか?')) return;
    await client.models.Entry.delete({ id: entryId });
  }

  if (loading) return <p className="text-sm text-black/60 dark:text-white/60">読み込み中...</p>;
  if (error || !trip) return <p className="text-sm text-red-600">{error ?? '旅行が見つかりませんでした。'}</p>;

  return (
    <div className="flex flex-col gap-6">
      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            タイトル
            <input
              className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              開始日
              <input
                type="date"
                className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              終了日
              <input
                type="date"
                className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            説明
            <textarea
              className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-black/20 px-4 py-2 text-sm dark:border-white/20"
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold">{trip.title}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-black/20 px-3 py-1.5 text-sm dark:border-white/20"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-700"
              >
                削除
              </button>
            </div>
          </div>
          {(trip.startDate || trip.endDate) && (
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              {trip.startDate ?? ''} {trip.startDate && trip.endDate ? '〜' : ''}{' '}
              {trip.endDate ?? ''}
            </p>
          )}
          {trip.description && <p className="mt-4 whitespace-pre-wrap">{trip.description}</p>}
        </div>
      )}

      <section className="border-t border-black/10 pt-6 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">記録</h2>
          <Link
            href={`/trips/${id}/entries/new`}
            className="rounded-md border border-black/20 px-3 py-1.5 text-sm dark:border-white/20"
          >
            + 記録を追加
          </Link>
        </div>

        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-black/60 dark:text-white/60">
            まだ記録がありません。「+ 記録を追加」から訪れた場所を記録しましょう。
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <TripMap entries={entries} />
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={handleDeleteEntry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
