export type MissionKind = 'water' | 'reps' | 'cardio';
export type MissionPlace = '집' | '헬스장' | '공원';

export type MissionSurvey = {
  places: string[];
  equipment: string[];
  cautions: string[];
  noCautions: boolean;
  experience: string | null;
};

export type MissionTemplate = {
  id: string;
  title: string;
  place: MissionPlace | '공통';
  equipment: string[];
  cautions: string[];
  kind: MissionKind;
  goal: number;
  unit: string;
  icon: string;
  coinReward: number;
  xpReward: number;
};

export type DailyMission = {
  id: string;
  title: string;
  current: number;
  goal: number;
  unit: string;
  done: boolean;
  kind: MissionKind;
  icon: string;
  coinReward: number;
  xpReward: number;
};

export const WATER_MISSION: DailyMission = {
  id: 'water',
  title: '물 2L 마시기',
  current: 0,
  goal: 2,
  unit: 'L',
  done: false,
  kind: 'water',
  icon: 'water',
  coinReward: 200,
  xpReward: 80,
};

const CATALOG: MissionTemplate[] = [
  { id: 'home-pushup', title: '푸쉬업', place: '집', equipment: ['맨몸'], cautions: ['손목', '어깨'], kind: 'reps', goal: 20, unit: '회', icon: 'pushup', coinReward: 300, xpReward: 100 },
  { id: 'home-squat', title: '스쿼트', place: '집', equipment: ['맨몸'], cautions: ['무릎', '허리'], kind: 'reps', goal: 25, unit: '회', icon: 'squat', coinReward: 300, xpReward: 100 },
  { id: 'home-plank', title: '플랭크', place: '집', equipment: ['맨몸', '요가매트'], cautions: ['손목', '허리'], kind: 'cardio', goal: 3, unit: '분', icon: 'cardio', coinReward: 200, xpReward: 80 },
  { id: 'home-lunge', title: '런지', place: '집', equipment: ['맨몸'], cautions: ['무릎'], kind: 'reps', goal: 20, unit: '회', icon: 'squat', coinReward: 280, xpReward: 95 },
  { id: 'home-burpee', title: '버피', place: '집', equipment: ['맨몸'], cautions: ['손목', '무릎'], kind: 'reps', goal: 12, unit: '회', icon: 'pushup', coinReward: 320, xpReward: 110 },
  { id: 'home-dumbbell', title: '덤벨 숄더프레스', place: '집', equipment: ['덤벨'], cautions: ['어깨'], kind: 'reps', goal: 15, unit: '회', icon: 'squat', coinReward: 300, xpReward: 100 },
  { id: 'home-band', title: '밴드 로우', place: '집', equipment: ['밴드'], cautions: ['어깨'], kind: 'reps', goal: 20, unit: '회', icon: 'cardio', coinReward: 250, xpReward: 90 },
  { id: 'home-yoga', title: '요가 스트레칭', place: '집', equipment: ['요가매트'], cautions: [], kind: 'cardio', goal: 15, unit: '분', icon: 'cardio', coinReward: 200, xpReward: 80 },
  { id: 'home-roller', title: '폼롤러 풀어주기', place: '집', equipment: ['폼롤러'], cautions: [], kind: 'cardio', goal: 10, unit: '분', icon: 'cardio', coinReward: 180, xpReward: 70 },

  { id: 'gym-bench', title: '벤치프레스', place: '헬스장', equipment: ['바벨'], cautions: ['어깨', '손목'], kind: 'reps', goal: 12, unit: '회', icon: 'pushup', coinReward: 350, xpReward: 120 },
  { id: 'gym-squat', title: '바벨 스쿼트', place: '헬스장', equipment: ['바벨'], cautions: ['무릎', '허리'], kind: 'reps', goal: 12, unit: '회', icon: 'squat', coinReward: 350, xpReward: 120 },
  { id: 'gym-deadlift', title: '데드리프트', place: '헬스장', equipment: ['바벨'], cautions: ['허리'], kind: 'reps', goal: 10, unit: '회', icon: 'squat', coinReward: 350, xpReward: 120 },
  { id: 'gym-dumbbell', title: '덤벨 프레스', place: '헬스장', equipment: ['덤벨'], cautions: ['어깨'], kind: 'reps', goal: 12, unit: '회', icon: 'pushup', coinReward: 300, xpReward: 100 },
  { id: 'gym-lat', title: '랫풀다운', place: '헬스장', equipment: [], cautions: ['어깨'], kind: 'reps', goal: 12, unit: '회', icon: 'cardio', coinReward: 300, xpReward: 100 },
  { id: 'gym-legpress', title: '레그프레스', place: '헬스장', equipment: [], cautions: ['무릎', '허리'], kind: 'reps', goal: 12, unit: '회', icon: 'squat', coinReward: 300, xpReward: 100 },
  { id: 'gym-run', title: '런닝머신', place: '헬스장', equipment: [], cautions: ['무릎', '발목'], kind: 'cardio', goal: 20, unit: '분', icon: 'cardio', coinReward: 250, xpReward: 90 },
  { id: 'gym-cycle', title: '실내 자전거', place: '헬스장', equipment: [], cautions: ['무릎'], kind: 'cardio', goal: 20, unit: '분', icon: 'walk', coinReward: 220, xpReward: 80 },

  { id: 'out-walk', title: '빠르게 걷기', place: '공원', equipment: [], cautions: ['발목', '무릎'], kind: 'cardio', goal: 25, unit: '분', icon: 'walk', coinReward: 220, xpReward: 80 },
  { id: 'out-run', title: '야외 달리기', place: '공원', equipment: [], cautions: ['무릎', '발목'], kind: 'cardio', goal: 20, unit: '분', icon: 'cardio', coinReward: 250, xpReward: 90 },
  { id: 'out-cycle', title: '자전거 타기', place: '공원', equipment: [], cautions: ['무릎'], kind: 'cardio', goal: 25, unit: '분', icon: 'walk', coinReward: 250, xpReward: 90 },
  { id: 'out-stretch', title: '야외 스트레칭', place: '공원', equipment: ['요가매트', '맨몸'], cautions: [], kind: 'cardio', goal: 10, unit: '분', icon: 'cardio', coinReward: 180, xpReward: 70 },
  { id: 'out-stairs', title: '계단 오르기', place: '공원', equipment: [], cautions: ['무릎', '발목'], kind: 'cardio', goal: 15, unit: '분', icon: 'walk', coinReward: 240, xpReward: 85 },
];

function hashSeed(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffle<T>(list: T[], random: () => number) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function experienceScale(experience: string | null) {
  if (experience === '입문') return 0.7;
  if (experience === '초보') return 0.85;
  if (experience === '숙련') return 1.25;
  return 1;
}

function toMission(template: MissionTemplate, scale: number): DailyMission {
  const goal = template.kind === 'reps' ? Math.max(8, Math.round(template.goal * scale)) : Math.max(5, Math.round(template.goal * scale));
  return {
    id: template.id,
    title: `${template.title} ${goal}${template.unit === '회' ? '회' : template.unit === '분' ? '분' : ''}`,
    current: 0,
    goal,
    unit: template.unit,
    done: false,
    kind: template.kind,
    icon: template.icon,
    coinReward: template.coinReward,
    xpReward: template.xpReward,
  };
}

function matchesEquipment(template: MissionTemplate, equipment: string[]) {
  if (template.equipment.length === 0) return true;
  if (equipment.length === 0) return template.equipment.includes('맨몸');
  return template.equipment.some((item) => equipment.includes(item));
}

function matchesCautions(template: MissionTemplate, survey: MissionSurvey) {
  if (survey.noCautions || survey.cautions.length === 0) return true;
  return !template.cautions.some((part) => survey.cautions.includes(part));
}

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function pickDailyMissions(survey: MissionSurvey, seedKey: string): DailyMission[] {
  const places = survey.places.length ? survey.places : ['집'];
  const scale = experienceScale(survey.experience);
  const random = rng(hashSeed(seedKey));
  const pool = CATALOG.filter((item) => (item.place === '공통' || places.includes(item.place)) && matchesEquipment(item, survey.equipment) && matchesCautions(item, survey));
  const usable = pool.length ? pool : CATALOG.filter((item) => item.place === '집' && item.equipment.includes('맨몸'));

  const picked: MissionTemplate[] = [];
  for (const place of shuffle(places, random)) {
    const options = shuffle(
      usable.filter((item) => item.place === place && !picked.some((row) => row.id === item.id)),
      random,
    );
    if (options[0]) picked.push(options[0]);
    if (picked.length >= 2) break;
  }

  const rest = shuffle(
    usable.filter((item) => !picked.some((row) => row.id === item.id)),
    random,
  );
  for (const item of rest) {
    if (picked.length >= 2) break;
    picked.push(item);
  }

  return [{ ...WATER_MISSION }, ...picked.slice(0, 2).map((item) => toMission(item, scale))];
}

export function isRolledMission(mission: { kind?: string }) {
  return mission.kind === 'water' || mission.kind === 'reps' || mission.kind === 'cardio';
}
