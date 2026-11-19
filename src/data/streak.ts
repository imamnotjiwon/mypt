import { todayKey, yesterdayKey } from './missions';

export function liveStreakDays(days: number, streakDate: string, now = new Date()) {
  if (!streakDate || days <= 0) return 0;
  if (streakDate === todayKey(now) || streakDate === yesterdayKey(now)) return days;
  return 0;
}
