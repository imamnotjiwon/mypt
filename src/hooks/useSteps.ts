import { useEffect, useMemo, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

const DEMO_TODAY = 32450;
const DEMO_WEEK = [18400, 22100, 32450, 19800, 25600, 14200, 8900];

function todayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

function mondayOf(date = new Date()) {
  const offset = todayIndex(date);
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function stepsBetween(start: Date, end: Date) {
  try {
    const result = await Pedometer.getStepCountAsync(start, end);
    return Math.max(0, result.steps || 0);
  } catch {
    return 0;
  }
}

async function loadWeekSteps(now = new Date()) {
  const monday = mondayOf(now);
  const days: number[] = [];
  for (let i = 0; i < 7; i += 1) {
    const start = new Date(monday);
    start.setDate(monday.getDate() + i);
    start.setHours(0, 0, 0, 0);
    if (start > now) {
      days.push(0);
      continue;
    }
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    const to = end > now ? now : end;
    days.push(await stepsBetween(start, to));
  }
  return days;
}

export function useSteps() {
  const [todaySteps, setTodaySteps] = useState(0);
  const [week, setWeek] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let sub: { remove: () => void } | undefined;
    let cancelled = false;

    (async () => {
      if (Platform.OS === 'web') return;

      const ok = await Pedometer.isAvailableAsync();
      if (cancelled) return;
      setAvailable(ok);
      if (!ok) return;

      if (Platform.OS === 'android') {
        try {
          await Pedometer.requestPermissionsAsync();
        } catch {
          // Expo Go may already prompt; keep going with whatever we can read.
        }
      }

      const days = await loadWeekSteps();
      if (cancelled) return;
      const index = todayIndex();
      setWeek(days);
      setTodaySteps(days[index] ?? 0);

      sub = Pedometer.watchStepCount((event) => {
        const add = Math.max(0, event.steps || 0);
        if (!add) return;
        setTodaySteps((prev) => prev + add);
        setWeek((prev) => {
          const next = [...prev];
          const i = todayIndex();
          next[i] = (next[i] ?? 0) + add;
          return next;
        });
      });
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  const weekTotal = useMemo(() => week.reduce((sum, value) => sum + value, 0), [week]);

  return {
    todaySteps: available ? todaySteps : DEMO_TODAY,
    week: available ? week : DEMO_WEEK,
    /** 미션 합산용 — 센서 없을 때는 데모 숫자 제외 */
    deviceWeekSteps: available ? weekTotal : 0,
    available,
  };
}
