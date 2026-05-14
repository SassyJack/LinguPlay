import { useMemo } from 'react';

const useActivityProgress = (
  completedActivities: Record<string, boolean>,
  levelActivities: { id: string }[] | undefined,
  currentActivityId: string | null | undefined
) => {
  const data = useMemo(() => {
    if (!levelActivities || !levelActivities.length) {
      return { completed: 0, total: 0, currentIndex: 0, progress: 0 };
    }
    const total = levelActivities.length;
    const completed = levelActivities.filter(a => completedActivities[a.id]).length;
    const currentIndex = levelActivities.findIndex(a => a.id === currentActivityId);
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, currentIndex: Math.max(0, currentIndex), progress };
  }, [completedActivities, levelActivities, currentActivityId]);

  return data;
};

export default useActivityProgress;
