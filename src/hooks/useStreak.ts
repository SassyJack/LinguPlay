import { useCallback, useState } from 'react';

const useStreak = () => {
  const [currentStreak, setCurrentStreak] = useState(0);

  const addCorrect = useCallback(() => {
    setCurrentStreak(prev => prev + 1);
  }, []);

  const resetStreak = useCallback(() => {
    setCurrentStreak(0);
  }, []);

  return { currentStreak, addCorrect, resetStreak };
};

export default useStreak;
