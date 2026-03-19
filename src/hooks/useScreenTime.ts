import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface ScreenTimeData {
  todayMinutes: number;
  baselineMinutes: number;
  percentReduction: number;
  weeklyAverage: number;
  isSyncing: boolean;
  isConnected: boolean;
}

// Screen Time Plugin interface
interface ScreenTimePlugin {
  requestPermissions(): Promise<{ granted: boolean }>;
  getTodayScreenTime(): Promise<{ totalMinutes: number; categoryBreakdown: Record<string, number> }>;
  getWeeklyAverage(): Promise<{ averageMinutes: number }>;
  getLastWeekDaily(): Promise<{ dailyAverageMinutes: number }>;
}

export const useScreenTime = () => {
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData>({
    todayMinutes: 0,
    baselineMinutes: 0,
    percentReduction: 0,
    weeklyAverage: 0,
    isSyncing: true,
    isConnected: false,
  });
  const [hasPermission, setHasPermission] = useState(false);

  const calculateReduction = (baseline: number, today: number): number => {
    if (baseline <= 0) return 0;
    return Math.round(((baseline - today) / baseline) * 100);
  };

  const syncScreenTime = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'ios') {
      // Web fallback — show syncing placeholder
      setScreenTimeData(prev => ({
        ...prev,
        isSyncing: false,
        isConnected: false,
      }));
      return;
    }

    setScreenTimeData(prev => ({ ...prev, isSyncing: true }));

    try {
      // @ts-ignore - Custom plugin
      const ScreenTime = Capacitor.Plugins.ScreenTime as ScreenTimePlugin;

      const { granted } = await ScreenTime.requestPermissions();
      setHasPermission(granted);

      if (granted) {
        const [todayData, weeklyData, baselineData] = await Promise.all([
          ScreenTime.getTodayScreenTime(),
          ScreenTime.getWeeklyAverage(),
          ScreenTime.getLastWeekDaily(),
        ]);

        const baseline = baselineData.dailyAverageMinutes;
        const today = todayData.totalMinutes;

        setScreenTimeData({
          todayMinutes: today,
          baselineMinutes: baseline,
          percentReduction: calculateReduction(baseline, today),
          weeklyAverage: weeklyData.averageMinutes,
          isSyncing: false,
          isConnected: true,
        });
      } else {
        setScreenTimeData(prev => ({ ...prev, isSyncing: false, isConnected: false }));
      }
    } catch (error) {
      console.error('Error fetching screen time:', error);
      setScreenTimeData(prev => ({ ...prev, isSyncing: false, isConnected: false }));
    }
  }, []);

  // Listen for native screenTimeUpdate events
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { todayMinutes, baselineMinutes, percentReduction } = e.detail;
      setScreenTimeData(prev => ({
        ...prev,
        todayMinutes,
        baselineMinutes,
        percentReduction,
        isConnected: true,
        isSyncing: false,
      }));
      setHasPermission(true);
    };
    window.addEventListener('screenTimeUpdate', handler as EventListener);
    return () => window.removeEventListener('screenTimeUpdate', handler as EventListener);
  }, []);

  useEffect(() => {
    syncScreenTime();
    const interval = setInterval(syncScreenTime, 3600000);
    return () => clearInterval(interval);
  }, [syncScreenTime]);

  return {
    screenTimeData,
    hasPermission,
    refreshScreenTime: syncScreenTime,
  };
};
