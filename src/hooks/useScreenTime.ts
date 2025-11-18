import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface ScreenTimeData {
  totalMinutes: number;
  musicMinutes: number;
  betterBuddyMinutes: number;
  weeklyAverage: number;
  isAutomatic: boolean;
}

// Screen Time Plugin interface
interface ScreenTimePlugin {
  requestPermissions(): Promise<{ granted: boolean }>;
  getTodayScreenTime(): Promise<{ totalMinutes: number; categoryBreakdown: Record<string, number> }>;
  getWeeklyAverage(): Promise<{ averageMinutes: number }>;
}

export const useScreenTime = () => {
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData>({
    totalMinutes: 0,
    musicMinutes: 0,
    betterBuddyMinutes: 0,
    weeklyAverage: 300,
    isAutomatic: false,
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeScreenTime = async () => {
      // Only works on native iOS
      if (Capacitor.getPlatform() === 'ios') {
        try {
          // @ts-ignore - Custom plugin
          const ScreenTime = Capacitor.Plugins.ScreenTime as ScreenTimePlugin;
          
          // Request permissions
          const { granted } = await ScreenTime.requestPermissions();
          setHasPermission(granted);

          if (granted) {
            // Fetch today's screen time
            const todayData = await ScreenTime.getTodayScreenTime();
            const weeklyData = await ScreenTime.getWeeklyAverage();

            // Extract music and Better Buddy times from category breakdown
            const musicMinutes = todayData.categoryBreakdown['Music'] || 0;
            const betterBuddyMinutes = todayData.categoryBreakdown['BetterBuddy'] || 0;

            setScreenTimeData({
              totalMinutes: todayData.totalMinutes,
              musicMinutes,
              betterBuddyMinutes,
              weeklyAverage: weeklyData.averageMinutes,
              isAutomatic: true,
            });
          }
        } catch (error) {
          console.error('Error fetching screen time:', error);
          // Fallback to manual input
          setScreenTimeData(prev => ({ ...prev, isAutomatic: false }));
        }
      } else {
        // Web or Android - use manual input
        setScreenTimeData(prev => ({ ...prev, isAutomatic: false }));
      }
      setIsLoading(false);
    };

    initializeScreenTime();

    // Refresh data every hour
    const interval = setInterval(initializeScreenTime, 3600000);
    return () => clearInterval(interval);
  }, []);

  const refreshScreenTime = async () => {
    if (Capacitor.getPlatform() === 'ios' && hasPermission) {
      setIsLoading(true);
      try {
        // @ts-ignore
        const ScreenTime = Capacitor.Plugins.ScreenTime as ScreenTimePlugin;
        const todayData = await ScreenTime.getTodayScreenTime();
        const weeklyData = await ScreenTime.getWeeklyAverage();

        const musicMinutes = todayData.categoryBreakdown['Music'] || 0;
        const betterBuddyMinutes = todayData.categoryBreakdown['BetterBuddy'] || 0;

        setScreenTimeData({
          totalMinutes: todayData.totalMinutes,
          musicMinutes,
          betterBuddyMinutes,
          weeklyAverage: weeklyData.averageMinutes,
          isAutomatic: true,
        });
      } catch (error) {
        console.error('Error refreshing screen time:', error);
      }
      setIsLoading(false);
    }
  };

  return {
    screenTimeData,
    hasPermission,
    isLoading,
    refreshScreenTime,
  };
};
