'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { uploadData } from 'aws-amplify/storage';
import { client } from '@/lib/amplify-client';
import MapPicker from '@/components/MapPicker';

type LatLng = { lat: number; lng: number };

export default function NewEntryPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const router = useRouter();
  const [placeName, setPlaceName] = useState('');
  const [visitedDate, setVisitedDate] = useState('');
  const [memo, setMemo] = useState('');
  const [position, setPosition] = useState<LatLng | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placeName.trim()) {
      setError('場所の名前を入力してください。');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      let photoKey: string | undefined;
      if (file) {
        const fileName = file.name;
        const uploadResult = await uploadData({
          path: ({ identityId }) => `photos/${identityId}/${Date.now()}-${fileName}`,
          data: file,
        }).result;
        photoKey = uploadResult.path;
      }

      const { errors } = await client.models.Entry.create({
        tripId,
        placeName: placeName.trim(),
        visitedDate: visitedDate || undefined,
        memo: memo.trim() || undefined,
        lat: position?.lat,
        lng: position?.lng,
        photoKey,
      });
      if (errors) {
        setError('記録の作成に失敗しました。');
        setSubmitting(false);
        return;
      }
      router.push(`/trips/${tripId}`);
    } catch {
      setError('記録の作成に失敗しました。');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">記録を追加</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          場所の名前
          <input
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="例: 清水寺"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          訪問日
          <input
            type="date"
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
            value={visitedDate}
            onChange={(e) => setVisitedDate(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          メモ
          <textarea
            className="rounded-md border border-black/20 px-3 py-2 dark:border-white/20"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          場所(地図をクリックして設定、任意)
          <MapPicker value={position} onChange={setPosition} />
          {position && (
            <p className="text-xs text-black/60 dark:text-white/60">
              緯度: {position.lat.toFixed(5)} / 経度: {position.lng.toFixed(5)}
            </p>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          写真(任意)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {submitting ? '追加中...' : '追加する'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/trips/${tripId}`)}
            className="rounded-md border border-black/20 px-4 py-2 text-sm dark:border-white/20"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
