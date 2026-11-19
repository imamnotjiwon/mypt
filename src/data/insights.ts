import { DailyMission, todayKey, yesterdayKey } from './missions';
import {
  WorkoutDay,
  dayForDate,
  daysInWeek,
  previousWeekDates,
  sumDays,
} from './workoutLog';

export type DailyInsight = {
  headline: string;
  detail: string;
  footer: string;
};

function seed(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function pick<T>(list: T[], key: string): T {
  return list[seed(key) % list.length];
}

function pct(now: number, prev: number) {
  if (prev <= 0) return now > 0 ? null : 0;
  return Math.round(((now - prev) / prev) * 100);
}

function wasActive(day: WorkoutDay) {
  return day.minutes >= 5 || day.steps >= 500 || day.kcal >= 20;
}

export function pickDailyInsight(input: {
  nickname: string;
  userId: string;
  logs: WorkoutDay[];
  missions: DailyMission[];
}): DailyInsight {
  const { nickname, userId, logs, missions } = input;
  const today = todayKey();
  const key = `${userId || 'guest'}-${today}`;
  const yesterday = dayForDate(logs, yesterdayKey());
  const thisWeek = sumDays(daysInWeek(logs, new Date(), missions));
  const lastWeek = sumDays(previousWeekDates().map((date) => dayForDate(logs, todayKey(date))));
  const stepPct = pct(thisWeek.steps, lastWeek.steps);
  const volPct = pct(thisWeek.minutes, lastWeek.minutes);

  if (!wasActive(yesterday)) {
    return pick(
      [
        {
          headline: '어제 운동을 쉬었어요',
          detail: '오늘은 조금만 더 노력해 보세요. 짧은 산책도 충분해요.',
          footer: `${nickname}의 루틴, 오늘부터 다시 이어가요.`,
        },
        {
          headline: '어제는 쉬는 날이었어요',
          detail: '연속이 끊겼다면 오늘 한 번만 움직여 보세요.',
          footer: `${nickname}, 다시 시작해도 전혀 늦지 않아요.`,
        },
        {
          headline: '조금 더 힘내 볼까요?',
          detail: '어제 비운 만큼, 오늘은 가벼운 미션부터 채워 보세요.',
          footer: `${nickname}도 오늘 한 걸음이면 충분해요.`,
        },
        {
          headline: '오늘은 회복 다음 날이에요',
          detail: '무리하지 말고, 걷기나 스트레칭으로 몸을 깨워 보세요.',
          footer: `${nickname}의 페이스로 천천히 올라가면 돼요.`,
        },
      ],
      key,
    );
  }

  if (typeof volPct === 'number' && volPct > 0) {
    return pick(
      [
        {
          headline: `지난주보다 운동량이 ${volPct}% 증가했어요!`,
          detail: '이 페이스면 곧 레벨업에 가까워져요.',
          footer: `${nickname}도 함께 성장하면서 점점 더 건강해지고 있어요.`,
        },
        {
          headline: `운동 시간이 ${volPct}% 늘었어요`,
          detail: '꾸준함이 숫자로 보이기 시작했어요.',
          footer: `${nickname}, 오늘의 미션도 이어서 챙겨 볼까요?`,
        },
      ],
      key,
    );
  }

  if (typeof stepPct === 'number' && stepPct > 0) {
    return pick(
      [
        {
          headline: `걸음 수가 지난주보다 ${stepPct}% 늘었어요`,
          detail: '일상 속 움직임이 확실히 늘고 있어요.',
          footer: `${nickname}의 발걸음, 이번 주도 좋아요.`,
        },
        {
          headline: `이번 주 걸음이 ${stepPct}% 증가했어요`,
          detail: '계단이든 산책이든, 쌓인 걸음이 차이를 만들어요.',
          footer: `${nickname}도 오늘 조금 더 걸어 볼까요?`,
        },
      ],
      key,
    );
  }

  if (lastWeek.minutes <= 0 && thisWeek.minutes > 0) {
    return pick(
      [
        {
          headline: '이번 주 운동을 시작했어요',
          detail: '지난주보다 움직임이 생겼어요. 이 흐름을 지켜 봐요.',
          footer: `${nickname}의 한 주, 지금부터 채워져요.`,
        },
      ],
      key,
    );
  }

  return pick(
    [
      {
        headline: '어제에 이어 잘하고 있어요',
        detail: '큰 변화보다 매일의 기록이 더 중요해요.',
        footer: `${nickname}도 오늘 미션만 챙기면 충분해요.`,
      },
      {
        headline: '컨디션을 유지하는 중이에요',
        detail: '늘지 않아도 멈추지 않는 게 실력이에요.',
        footer: `${nickname}, 오늘은 가볍게라도 몸을 움직여 보세요.`,
      },
      {
        headline: '루틴이 자리를 잡고 있어요',
        detail: '같은 시간에 조금씩 반복하면 몸이 먼저 기억해요.',
        footer: `${nickname}의 페이스, 이대로 좋아요.`,
      },
    ],
    key,
  );
}
