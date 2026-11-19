import { todayKey } from './missions';

export const WEEKLY_STEPS_GOAL = 50000;
export const WEEKLY_BONUS_COINS = 2000;
export const WEEKLY_BONUS_XP = 500;
export const WEEKLY_MISSION_HINT =
  '이번주 동안 해야 할 미션을 올클리어 시 풍부한 보상이 기다리고 있습니다';

export function currentWeekKey(date = new Date()) {
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset);
  return todayKey(monday);
}
