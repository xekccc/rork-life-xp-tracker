import { useState, useCallback, useEffect, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moment, userData as initialUserData } from '@/mocks/moments';

const STORAGE_KEY = 'life_xp_moments';

export const [MomentsProvider, useMoments] = createContextHook(() => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMoments = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedMoments) {
          setMoments(JSON.parse(storedMoments));
        } else {
          setMoments([]);
        }
      } catch (error) {
        console.log('Error loading data:', error);
        setMoments([]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  const todaysMoments = useMemo(() => {
    const today = new Date().toDateString();
    return moments.filter((m) => {
      const momentTimestamp = parseInt(m.id, 10);
      if (isNaN(momentTimestamp)) return false;
      const momentDate = new Date(momentTimestamp).toDateString();
      return momentDate === today;
    });
  }, [moments]);

  const currentXP = useMemo(() => {
    return todaysMoments.reduce((sum, m) => sum + m.xp, 0);
  }, [todaysMoments]);

  const timeBreakdown = useMemo(() => {
    const now = new Date();
    const minutesPassed = now.getHours() * 60 + now.getMinutes();
    
    let focusMinutes = 0;
    let joyMinutes = 0;
    
    todaysMoments.forEach(moment => {
      const duration = moment.duration || 15;
      if (moment.category === 'focus') {
        focusMinutes += duration;
      } else {
        joyMinutes += duration;
      }
    });
    
    const totalTrackedMinutes = focusMinutes + joyMinutes;
    const restMinutes = Math.max(0, minutesPassed - totalTrackedMinutes);
    
    const totalForPercentage = totalTrackedMinutes + restMinutes;
    
    if (totalForPercentage === 0) {
      return { focus: 0, joy: 0, rest: 100 };
    }
    
    const focus = Math.round((focusMinutes / totalForPercentage) * 100);
    const joy = Math.round((joyMinutes / totalForPercentage) * 100);
    const rest = Math.max(0, 100 - focus - joy);
    
    return { focus, joy, rest };
  }, [todaysMoments]);

  const hoursLeft = useMemo(() => {
    const now = new Date();
    return Math.max(0, 24 - now.getHours());
  }, []);

  const addMoment = useCallback((moment: Omit<Moment, 'id' | 'time'>) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const newMoment: Moment = {
      ...moment,
      id: Date.now().toString(),
      time: timeString,
    };

    setMoments(prev => {
      const updated = [newMoment, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setMoments([]);
      console.log('All data cleared');
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  }, []);

  const deleteMoment = useCallback((momentId: string) => {
    setMoments(prev => {
      const updated = prev.filter(m => m.id !== momentId);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    moments,
    currentXP,
    addMoment,
    deleteMoment,
    clearAllData,
    userData: initialUserData,
    isLoaded,
    timeBreakdown,
    hoursLeft,
  };
});
