import { useCallback, useEffect, useState } from 'react';
import { DailyQuota, Progress } from '../core/types';
import { Api, ApiError } from '../services/api';

const defaultProgress: Progress = { math: { level: 0, of: 50 }, readingWriting: { level: 0, of: 50 }, overall: { level: 0, of: 100 } };

export function useDashboardData(api: Api | null) {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [quota, setQuota] = useState<DailyQuota>({ math: 0, readingWriting: 0 });
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const refreshDashboard = useCallback(() => {
    if (!api) return;
    api.getDashboard()
      .then(({ progress: freshProgress, quota: freshQuota }) => {
        setProgress(freshProgress);
        setQuota(freshQuota);
        setDashboardError(null);
      })
      .catch((caught) => {
        if (!(caught instanceof ApiError && caught.status === 401)) {
          setDashboardError(caught instanceof Error ? caught.message : 'Could not load your progress.');
        }
      });
  }, [api]);

  useEffect(() => { refreshDashboard(); }, [refreshDashboard]);

  const resetDashboard = () => {
    setProgress(defaultProgress);
    setQuota({ math: 0, readingWriting: 0 });
  };

  return { progress, setProgress, quota, setQuota, dashboardError, refreshDashboard, resetDashboard };
}