import { useState, useCallback, useEffect, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Moment, userData as initialUserData } from '@/mocks/moments';

const STORAGE_KEY = 'life_xp_moments';
const XP_STORAGE_KEY = 'life_xp_current';

export const [MomentsProvider, useMoments] = createContextHook(() => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [currentXP, setCurrentXP] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedMoments, storedXP] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(XP_STORAGE_KEY),
        ]);

        if (storedMoments) {
          setMoments(JSON.parse(storedMoments));
        } else {
          setMoments([]);
        }

        if (storedXP) {
          setCurrentXP(JSON.parse(storedXP));
        } else {
          setCurrentXP(0);
        }
      } catch (error) {
        console.log('Error loading data:', error);
        setMoments([]);
        setCurrentXP(0);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  const timeBreakdown = useMemo(() => {
    const now = new Date();
    const minutesPassed = now.getHours() * 60 + now.getMinutes();
    
    let focusMinutes = 0;
    let joyMinutes = 0;
    
    moments.forEach(moment => {
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
  }, [moments]);

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
    setCurrentXP(prev => {
      const updated = prev + moment.xp;
      AsyncStorage.setItem(XP_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        AsyncStorage.removeItem(XP_STORAGE_KEY),
      ]);
      setMoments([]);
      setCurrentXP(0);
      console.log('All data cleared');
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  }, []);

  const deleteMoment = useCallback((momentId: string) => {
    setMoments(prev => {
      const momentToDelete = prev.find(m => m.id === momentId);
      if (!momentToDelete) return prev;

      const updated = prev.filter(m => m.id !== momentId);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setCurrentXP(xp => {
        const updatedXP = xp - momentToDelete.xp;
        AsyncStorage.setItem(XP_STORAGE_KEY, JSON.stringify(updatedXP));
        return updatedXP;
      });

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
