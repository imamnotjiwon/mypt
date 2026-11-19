import { DailyMission, normalizeDateKey, todayKey } from './missions';

export type WorkoutDay = {
  date: string;
  runKm: number;
  cycleKm: number;
  weightsMin: number;
  squatReps: number;
  steps: number;
  minutes: number;
  kcal: number;
};

export function emptyWorkoutDay(date: string): WorkoutDay {
  return { date, runKm: 0, cycleKm: 0, weightsMin: 0, squatReps: 0, steps: 0, minutes: 0, kcal: 0 };
}

export function isWorkoutDay(value: unknown): value is WorkoutDay {
  if (!value || typeof value !== 'object') return false;
  const row = value as WorkoutDay;
  return typeof row.date === 'string' && typeof row.minutes === 'number';
}

export function weekDates(anchor = new Date()) {
  const mondayOffset = (anchor.getDay() + 6) % 7;
  const monday = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
}

export function previousWeekDates(anchor = new Date()) {
  const thisWeek = weekDates(anchor);
  return weekDates(new Date(thisWeek[0].getFullYear(), thisWeek[0].getMonth(), thisWeek[0].getDate() - 7));
}

function contribution(mission: DailyMission): WorkoutDay {
  const amount = Math.max(0, mission.current);
  if (!amount || mission.kind === 'water') return emptyWorkoutDay('');

  if (mission.kind === 'reps') {
    const minutes = (amount * 5) / 60;
    const squat = /스쿼트/.test(mission.title) ? amount : 0;
    return {
      date: '',
      runKm: 0,
      cycleKm: 0,
      weightsMin: minutes,
      squatReps: squat,
      steps: 0,
      minutes,
      kcal: amount * 0.4,
    };
  }

  const minutes = amount;
  const name = mission.title;
  if (/자전거/.test(name)) {
    return { date: '', runKm: 0, cycleKm: minutes * 0.28, weightsMin: 0, squatReps: 0, steps: 0, minutes, kcal: minutes * 8 };
  }
  if (/걷기/.test(name)) {
    return { date: '', runKm: minutes * 0.08, cycleKm: 0, weightsMin: 0, squatReps: 0, steps: Math.round(minutes * 110), minutes, kcal: minutes * 5 };
  }
  if (/계단/.test(name)) {
    return { date: '', runKm: minutes * 0.05, cycleKm: 0, weightsMin: 0, squatReps: 0, steps: Math.round(minutes * 90), minutes, kcal: minutes * 7 };
  }
  if (/달리기|런닝/.test(name)) {
    return { date: '', runKm: minutes * 0.12, cycleKm: 0, weightsMin: 0, squatReps: 0, steps: Math.round(minutes * 140), minutes, kcal: minutes * 10 };
  }
  if (/요가|스트레칭|폼롤러/.test(name)) {
    return { date: '', runKm: 0, cycleKm: 0, weightsMin: 0, squatReps: 0, steps: 0, minutes, kcal: minutes * 4 };
  }
  if (/플랭크/.test(name)) {
    return { date: '', runKm: 0, cycleKm: 0, weightsMin: minutes, squatReps: 0, steps: 0, minutes, kcal: minutes * 5 };
  }
  return { date: '', runKm: 0, cycleKm: 0, weightsMin: minutes, squatReps: 0, steps: 0, minutes, kcal: minutes * 6 };
}

function addDays(a: WorkoutDay, b: WorkoutDay, date: string): WorkoutDay {
  return {
    date,
    runKm: a.runKm + b.runKm,
    cycleKm: a.cycleKm + b.cycleKm,
    weightsMin: a.weightsMin + b.weightsMin,
    squatReps: a.squatReps + b.squatReps,
    steps: a.steps + b.steps,
    minutes: a.minutes + b.minutes,
    kcal: a.kcal + b.kcal,
  };
}

export function dayFromMissions(date: string, missions: DailyMission[]): WorkoutDay {
  return missions.reduce((sum, mission) => addDays(sum, contribution(mission), date), emptyWorkoutDay(date));
}

export function upsertWorkoutDay(logs: WorkoutDay[], next: WorkoutDay): WorkoutDay[] {
  const key = normalizeDateKey(next.date);
  const normalized = { ...next, date: key };
  const rest = logs.filter((row) => normalizeDateKey(row.date) !== key);
  if (
    normalized.minutes <= 0 &&
    normalized.runKm <= 0 &&
    normalized.cycleKm <= 0 &&
    normalized.squatReps <= 0 &&
    normalized.steps <= 0
  ) {
    return rest;
  }
  return [...rest, normalized];
}

export function dayForDate(logs: WorkoutDay[], date: string, todayMissions?: DailyMission[]): WorkoutDay {
  const key = normalizeDateKey(date);
  if (todayMissions && key === todayKey()) return dayFromMissions(key, todayMissions);
  const found = logs.find((row) => normalizeDateKey(row.date) === key);
  return found ? { ...found, date: key } : emptyWorkoutDay(key);
}

export function sumDays(days: WorkoutDay[], date = ''): WorkoutDay {
  return days.reduce((sum, row) => addDays(sum, row, date), emptyWorkoutDay(date));
}

export function daysInWeek(logs: WorkoutDay[], anchor: Date, todayMissions?: DailyMission[]): WorkoutDay[] {
  return weekDates(anchor).map((date) => dayForDate(logs, todayKey(date), todayMissions));
}

export function formatKm(km: number) {
  if (km <= 0) return '0km';
  const rounded = km < 10 ? km.toFixed(1) : km.toFixed(0);
  return `${rounded.replace(/\.0$/, '')}km`;
}

export function formatHours(minutes: number) {
  if (minutes <= 0) return '0분';
  if (minutes < 60) return `${Math.round(minutes)}분`;
  const hours = minutes / 60;
  const label = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(/\.0$/, '');
  return `${label}시간`;
}

export function formatClock(minutes: number) {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m}분`;
  if (m <= 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function bodyTypeLabel(survey: { height?: string; weight?: string }) {
  const height = Number(String(survey.height ?? '').replace(/[^\d.]/g, ''));
  const weight = Number(String(survey.weight ?? '').replace(/[^\d.]/g, ''));
  if (height < 80 || height > 250 || weight < 20 || weight > 300) return '미입력';
  const bmi = weight / (height / 100) ** 2;
  if (bmi < 18.5) return '저체중';
  if (bmi < 23) return '표준체형';
  if (bmi < 25) return '과체중';
  return '비만';
}
