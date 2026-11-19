export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
export const NICKNAME_CHANGE_COST = 3000;

export const FREQUENCY_OPTIONS = [
  { id: '1-2', title: '주 1~2회', subtitle: '가볍게 시작' },
  { id: '3-4', title: '주 3~4회', subtitle: '꾸준히 유지' },
  { id: '5+', title: '주 5회 이상', subtitle: '거의 매일' },
] as const;

export function maxWorkoutDays(frequency: string | null) {
  if (frequency === '3-4') return 4;
  if (frequency === '5+') return 7;
  return 2;
}

export function minWorkoutDays(frequency: string | null) {
  if (frequency === '3-4') return 3;
  if (frequency === '5+') return 5;
  return 1;
}

export function defaultWorkoutDays(frequency: string | null) {
  if (frequency === '3-4') return ['월', '수', '금', '일'];
  if (frequency === '5+') return ['월', '화', '수', '목', '금'];
  return ['월', '목'];
}

export function clampWorkoutDays(days: string[], frequency: string | null) {
  const allowed = days.filter((day) => WEEKDAYS.includes(day as (typeof WEEKDAYS)[number]));
  const unique = WEEKDAYS.filter((day) => allowed.includes(day));
  return unique.slice(0, maxWorkoutDays(frequency));
}

export function frequencyLabel(frequency: string | null) {
  return FREQUENCY_OPTIONS.find((item) => item.id === frequency)?.title ?? '주 1~2회';
}

export function workoutDaysValid(days: string[], frequency: string | null) {
  const next = clampWorkoutDays(days, frequency);
  return next.length >= minWorkoutDays(frequency) && next.length <= maxWorkoutDays(frequency);
}
