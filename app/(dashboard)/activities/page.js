'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ActivityIconMap } from './utils';

const fetchActivities = async (page = 0) => {
  const res = await fetch(`/api/activities?page=${page}&limit=10`);
  return res.json();
};

export default function ActivitiesPage() {
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['activities'],
    queryFn: ({ pageParam = 0 }) => fetchActivities(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Activity Timeline</h2>

      {data?.pages.flatMap((pg) => pg.activities).map((act, i) => (
        <div key={i} className="flex items-start space-x-3 p-4 border rounded-md">
          <div>{ActivityIconMap[act.action] || '📌'}</div>
          <div>
            <div className="text-sm text-gray-800 font-semibold">{act.action.replace('_', ' ')}</div>
            <div className="text-xs text-gray-500">
              {act.entityName} • {formatDistanceToNow(new Date(act.timestamp))} ago
            </div>
          </div>
        </div>
      ))}

      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
