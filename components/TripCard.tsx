import Link from 'next/link';
import type { Schema } from '@/amplify/data/resource';

type Trip = Schema['Trip']['type'];

export default function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
    >
      <h2 className="font-semibold">{trip.title}</h2>
      {(trip.startDate || trip.endDate) && (
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {trip.startDate ?? ''} {trip.startDate && trip.endDate ? '〜' : ''}{' '}
          {trip.endDate ?? ''}
        </p>
      )}
      {trip.description && (
        <p className="mt-2 line-clamp-2 text-sm text-black/70 dark:text-white/70">
          {trip.description}
        </p>
      )}
    </Link>
  );
}
