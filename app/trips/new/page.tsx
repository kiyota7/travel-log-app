'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/amplify-client';

export default function NewTripPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('タイトルを入力してください。');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { data: trip, errors } = await client.models.Trip.create({
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isPublic,
    });
    if (errors || !trip) {
      setError('旅行の作成に失敗しました。');
      setSubmitting(false);
      return;
    }
    router.push(`/trips/${trip.id}`);
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">新しい旅行を作成</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          タイトル
          <input
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 京都旅行"
          />
        </label>

        <div className="flex gap-4">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            開始日
            <input
              type="date"
              className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            終了日
            <input
              type="date"
              className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          説明(任意)
          <textarea
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          みんなに公開する(「みんなの記録」フィードに表示されます)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {submitting ? '作成中...' : '作成する'}
        </button>
      </form>
    </div>
  );
}
