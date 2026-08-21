import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export function useSteps() {
  const [todaySteps, setTodaySteps] = useState(32450);
  const [available, setAvailable] = useState(false);
  const [week, setWeek] = useState([18400, 22100, 32450, 19800, 25600, 14200, 8900]);

  useEffect(() => {
    let sub: { remove: () => void } | undefined;

    (async () => {
      if (Platform.OS === 'web') return;

      const ok = await Pedometer.isAvailableAsync();
      setAvailable(ok);
      if (!ok) return;

      if (Platform.OS === 'android') {
        try {
          await Pedometer.requestPermissionsAsync();
        } catch {
          // Expo Go may already prompt; keep going with whatever we can read.
        }
      }

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(start, new Date());
        setTodaySteps(result.steps);
        setWeek((prev) => {
          const next = [...prev];
          next[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] = result.steps;
          return next;
        });
      } catch {
        // Simulator / missing Health Connect — keep demo-friendly numbers.
      }

      sub = Pedometer.watchStepCount((event) => {
        setTodaySteps((prev) => prev + event.steps);
      });
    })();

    return () => sub?.remove();
  }, []);

  return { todaySteps, available, week };
}
