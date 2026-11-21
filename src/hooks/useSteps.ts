import { useEffect, useMemo, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/** 평균 보폭 ~0.78m */
export const METERS_PER_STEP = 0.78;
/** 걷기 기준 대략치 */
export const KCAL_PER_STEP = 0.04;

export function stepsToKm(steps: number) {
  return Math.max(0, steps) * METERS_PER_STEP / 1000;
}

export function stepsToKcal(steps: number) {
  return Math.round(Math.max(0, steps) * KCAL_PER_STEP);
}

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

async function ensurePedometerPermission() {
  try {
    const current = await Pedometer.getPermissionsAsync();
    if (current.granted) return true;
    const next = await Pedometer.requestPermissionsAsync();
    return next.granted;
  } catch {
    // Older Expo Go builds may not expose permission helpers.
    return true;
  }
}

export function useSteps() {
  const [todaySteps, setTodaySteps] = useState(0);
  const [week, setWeek] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let sub: { remove: () => void } | undefined;
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | undefined;

    (async () => {
      if (Platform.OS === 'web') return;

      const ok = await Pedometer.isAvailableAsync();
      if (cancelled) return;
      if (!ok) {
        setAvailable(false);
        return;
      }

      const granted = await ensurePedometerPermission();
      if (cancelled || !granted) {
        setAvailable(false);
        return;
      }

      setAvailable(true);

      const refresh = async () => {
        const days = await loadWeekSteps();
        if (cancelled) return;
        const index = todayIndex();
        setWeek(days);
        setTodaySteps(days[index] ?? 0);
      };

      await refresh();
      // iOS getStepCountAsync is authoritative for "today"; refresh periodically.
      poll = setInterval(() => {
        refresh().catch(() => undefined);
      }, 15000);

      sub = Pedometer.watchStepCount(() => {
        refresh().catch(() => undefined);
      });
    })();

    return () => {
      cancelled = true;
      sub?.remove();
      if (poll) clearInterval(poll);
    };
  }, []);

  const weekTotal = useMemo(() => week.reduce((sum, value) => sum + value, 0), [week]);

  return {
    todaySteps: available ? todaySteps : 0,
    week: available ? week : [0, 0, 0, 0, 0, 0, 0],
    deviceWeekSteps: available ? weekTotal : 0,
    available,
    distanceKm: stepsToKm(available ? todaySteps : 0),
    calories: stepsToKcal(available ? todaySteps : 0),
  };
}
