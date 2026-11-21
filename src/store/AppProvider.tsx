import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CharacterId } from '../data/characters';
import { DailyMission, isRolledMission, pickDailyMissions, todayKey, yesterdayKey } from '../data/missions';
import { defaultWorkoutDays } from '../data/schedule';
import { liveStreakDays } from '../data/streak';
import { currentWeekKey, WEEKLY_BONUS_COINS, WEEKLY_BONUS_XP, WEEKLY_STEPS_GOAL } from '../data/weekly';
import { WorkoutDay, dayFromMissions, daysInWeek, isWorkoutDay, sumDays, upsertWorkoutDay } from '../data/workoutLog';
import { useSteps } from '../hooks/useSteps';
import * as api from '../api';

export type ScreenName =
  | 'login'
  | 'signup'
  | 'findPassword'
  | 'welcome'
  | 'survey'
  | 'character'
  | 'routine'
  | 'home'
  | 'quest'
  | 'exercise'
  | 'shop'
  | 'community'
  | 'profile'
  | 'profileEdit'
  | 'dex'
  | 'friends'
  | 'pushup'
  | 'cardio'
  | 'chat'
  | 'coinShop';

export type SurveyData = {
  age: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: 'male' | 'female' | null;
  height: string;
  weight: string;
  goalWeight: string;
  places: string[];
  equipment: string[];
  goal: string | null;
  frequency: string | null;
  workoutDays: string[];
  focus: string[];
  cautions: string[];
  noCautions: boolean;
  experience: string | null;
};

export type Mission = DailyMission;

type AppState = {
  ready: boolean;
  screen: ScreenName;
  previousTab: ScreenName;
  characterId: CharacterId;
  nickname: string;
  coins: number;
  level: number;
  xp: number;
  streakDays: number;
  survey: SurveyData;
  missions: Mission[];
  workoutLogs: WorkoutDay[];
  activeMission: Mission | null;
  chatPeerId: string | null;
  weeklyStepsGoal: number;
  weeklyStepsCurrent: number;
  todaySteps: number;
  stepWeek: number[];
  weeklyBonusClaimed: boolean;
  pendingWeeklyReward: { coins: number; xp: number } | null;
  dismissWeeklyReward: () => void;
  ownedItems: string[];
  equippedItem: string;
  pendingUsername: string;
  userId: string;
  token: string | null;
  nicknameChanges: number;
  go: (screen: ScreenName) => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (input: { nickname: string; username: string; password: string }) => Promise<void>;
  resetPassword: (input: { username: string; nickname: string; password: string }) => Promise<void>;
  logout: () => void;
  saveSurvey: (data: SurveyData) => void;
  updateProfile: (input: { nickname: string; survey: SurveyData }) => Promise<void>;
  setCharacter: (id: CharacterId) => void;
  selectCharacter: (id: CharacterId) => void;
  finishOnboarding: () => void;
  startMission: (id: string) => void;
  saveMissionProgress: (id: string, current: number) => void;
  openChat: (peerId: string) => void;
  addWater: (ml: number) => boolean;
  completeMission: (id: string, coinReward: number, xpReward: number) => void;
  addCoins: (amount: number) => void;
  buyItem: (id: string, price: number) => boolean;
  equipItem: (id: string) => void;
  openCoinShop: () => void;
  closeCoinShop: () => void;
};

const STORAGE_KEY = 'mypt-state-v4';
const OVERLAY_SCREENS: ScreenName[] = ['profile', 'profileEdit', 'dex', 'friends', 'pushup', 'cardio', 'chat', 'coinShop'];
const AUTH_SCREENS: ScreenName[] = ['login', 'signup', 'findPassword'];
const TAB_SCREENS: ScreenName[] = ['home', 'quest', 'exercise', 'shop', 'community'];
const CHARACTER_IDS: CharacterId[] = ['otter', 'rabbit', 'cat', 'gorilla', 'dog', 'hamster', 'sloth', 'bear'];

const defaultSurvey: SurveyData = {
  age: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  gender: null,
  height: '',
  weight: '',
  goalWeight: '',
  places: [],
  equipment: [],
  goal: null,
  frequency: null,
  workoutDays: [],
  focus: [],
  cautions: [],
  noCautions: false,
  experience: null,
};

const defaultMissions: Mission[] = pickDailyMissions(defaultSurvey, 'guest');

function resolveDailyMissions(user: api.RemoteUser, nextSurvey: SurveyData, localDate?: string): { missions: Mission[]; missionsDate: string } {
  const key = todayKey();
  const savedDate = (typeof user.missionsDate === 'string' && user.missionsDate) || localDate || '';
  const saved = Array.isArray(user.missions) ? (user.missions as Mission[]) : [];
  if (savedDate === key && saved.length > 0 && saved.every(isRolledMission)) {
    return { missions: saved, missionsDate: key };
  }
  return { missions: pickDailyMissions(nextSurvey, `${user.id}-${key}`), missionsDate: key };
}

const AppContext = createContext<AppState | null>(null);

function applyXp(current: number, add: number, bumpLevel: () => void) {
  const next = current + add;
  if (next >= 1000) {
    bumpLevel();
    return next - 1000;
  }
  return next;
}

function asCharacterId(value: string): CharacterId {
  return CHARACTER_IDS.includes(value as CharacterId) ? (value as CharacterId) : 'otter';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<ScreenName>('login');
  const [previousTab, setPreviousTab] = useState<ScreenName>('home');
  const [characterId, setCharacterId] = useState<CharacterId>('otter');
  const [nickname, setNickname] = useState('');
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [survey, setSurvey] = useState<SurveyData>(defaultSurvey);
  const [missions, setMissions] = useState<Mission[]>(defaultMissions);
  const [missionsDate, setMissionsDate] = useState('');
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutDay[]>([]);
  const [streakDate, setStreakDate] = useState('');
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [chatPeerId, setChatPeerId] = useState<string | null>(null);
  const [weeklyStepsGoal] = useState(WEEKLY_STEPS_GOAL);
  const { todaySteps, week: stepWeek, deviceWeekSteps } = useSteps();
  const weeklyStepsCurrent = useMemo(() => {
    const missionSteps = Math.round(sumDays(daysInWeek(workoutLogs, new Date(), missions)).steps);
    return missionSteps + deviceWeekSteps;
  }, [workoutLogs, missions, deviceWeekSteps]);
  const [weeklyBonusWeek, setWeeklyBonusWeek] = useState('');
  const [pendingWeeklyReward, setPendingWeeklyReward] = useState<{ coins: number; xp: number } | null>(null);
  const weeklyAwardLock = useRef('');
  const [ownedItems, setOwnedItems] = useState<string[]>(['jacket']);
  const [equippedItem, setEquippedItem] = useState('jacket');
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [onboarded, setOnboarded] = useState(false);
  const [pendingUsername, setPendingUsername] = useState('');
  const [nicknameChanges, setNicknameChanges] = useState(0);
  const [coinShopReturn, setCoinShopReturn] = useState<ScreenName>('profile');

  const hydrate = (user: api.RemoteUser, localDate?: string) => {
    setUserId(user.id);
    setNickname(user.nickname);
    setCoins(user.coins);
    setLevel(user.level);
    setXp(user.xp);
    setStreakDays(liveStreakDays(user.streakDays, typeof user.streakDate === 'string' ? user.streakDate : ''));
    setCharacterId(asCharacterId(user.characterId));
    setOnboarded(!!user.onboarded);
    const nextSurvey = user.survey
      ? {
          ...defaultSurvey,
          ...(user.survey as Partial<SurveyData>),
          workoutDays: Array.isArray((user.survey as Partial<SurveyData>).workoutDays)
            ? ((user.survey as Partial<SurveyData>).workoutDays as string[])
            : [],
        }
      : defaultSurvey;
    setSurvey(nextSurvey);
    const daily = resolveDailyMissions(user, nextSurvey, localDate);
    setMissions(daily.missions);
    setMissionsDate(daily.missionsDate);
    setWorkoutLogs(Array.isArray(user.workoutLogs) ? user.workoutLogs.filter(isWorkoutDay) : []);
    setStreakDate(typeof user.streakDate === 'string' ? user.streakDate : '');
    setNicknameChanges(typeof user.nicknameChanges === 'number' ? user.nicknameChanges : 0);
    setActiveMissionId(null);
    setChatPeerId(null);
    if (Array.isArray(user.ownedItems)) {
      const next = user.ownedItems.includes('jacket') ? user.ownedItems : ['jacket', ...user.ownedItems];
      setOwnedItems(next.includes(user.characterId) ? next : [...next, user.characterId]);
    } else {
      setOwnedItems(['jacket', user.characterId]);
    }
    const nextEquipped = typeof user.equippedItem === 'string' && user.equippedItem ? user.equippedItem : 'jacket';
    setEquippedItem(nextEquipped);
    setWeeklyBonusWeek(typeof user.weeklyBonusWeek === 'string' ? user.weeklyBonusWeek : '');
    weeklyAwardLock.current = typeof user.weeklyBonusWeek === 'string' ? user.weeklyBonusWeek : '';
    setPendingWeeklyReward(null);
  };

  useEffect(() => {
    api
      .initApiBase()
      .then(() => AsyncStorage.getItem(STORAGE_KEY))
      .then(async (raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        const savedToken = typeof saved.token === 'string' ? saved.token : '';
        if (!savedToken) return;
        try {
          const { user } = await api.getMe(savedToken);
          setToken(savedToken);
          hydrate(user, typeof saved.missionsDate === 'string' ? saved.missionsDate : '');
          const nextScreen = saved.screen as ScreenName | undefined;
          if (nextScreen && !AUTH_SCREENS.includes(nextScreen) && !OVERLAY_SCREENS.includes(nextScreen)) {
            setScreen(nextScreen);
          } else {
            setScreen(user.onboarded ? 'home' : 'welcome');
          }
          if (saved.previousTab) setPreviousTab(saved.previousTab);
        } catch {
          setToken(null);
          setScreen('login');
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const persistScreen = !token
      ? 'login'
      : OVERLAY_SCREENS.includes(screen)
        ? previousTab
        : AUTH_SCREENS.includes(screen)
          ? 'login'
          : screen;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token,
        screen: persistScreen,
        previousTab,
        characterId,
        nickname,
        coins,
        level,
        xp,
        streakDays,
        survey,
        missions,
        missionsDate,
        workoutLogs,
        streakDate,
        ownedItems,
        equippedItem,
        weeklyBonusWeek,
        onboarded,
      }),
    );
    if (token) {
      api
        .saveMe(token, {
          coins,
          level,
          xp,
          streakDays,
          characterId,
          onboarded,
          survey,
          missions,
          missionsDate,
          workoutLogs,
          streakDate,
          ownedItems,
          equippedItem,
          weeklyBonusWeek,
        })
        .catch(() => undefined);
    }
  }, [ready, token, screen, previousTab, characterId, nickname, coins, level, xp, streakDays, streakDate, survey, missions, missionsDate, workoutLogs, ownedItems, equippedItem, weeklyBonusWeek, onboarded]);

  useEffect(() => {
    if (!ready || !onboarded) return;
    const key = todayKey();
    if (missionsDate === key) return;
    setMissions(pickDailyMissions(survey, `${userId || 'guest'}-${key}`));
    setMissionsDate(key);
  }, [ready, onboarded, missionsDate, survey, userId]);

  useEffect(() => {
    if (!ready || !onboarded) return;
    const key = todayKey();
    if (missionsDate !== key) return;
    setWorkoutLogs((prev) => upsertWorkoutDay(prev, dayFromMissions(key, missions)));
  }, [ready, onboarded, missions, missionsDate]);

  useEffect(() => {
    if (!ready || !onboarded) return;
    const next = liveStreakDays(streakDays, streakDate);
    if (next !== streakDays) setStreakDays(next);
  }, [ready, onboarded, streakDate, streakDays]);

  useEffect(() => {
    if (!ready || !onboarded) return;
    const key = currentWeekKey();
    if (weeklyStepsCurrent < weeklyStepsGoal) return;
    if (weeklyBonusWeek === key || weeklyAwardLock.current === key) return;
    weeklyAwardLock.current = key;
    setWeeklyBonusWeek(key);
    setCoins((c) => c + WEEKLY_BONUS_COINS);
    setXp((x) => applyXp(x, WEEKLY_BONUS_XP, () => setLevel((lv) => lv + 1)));
    setPendingWeeklyReward({ coins: WEEKLY_BONUS_COINS, xp: WEEKLY_BONUS_XP });
  }, [ready, onboarded, weeklyStepsCurrent, weeklyStepsGoal, weeklyBonusWeek]);

  const bumpStreak = () => {
    const key = todayKey();
    setStreakDate((prev) => {
      if (prev === key) return prev;
      setStreakDays((days) => (prev === yesterdayKey() ? days + 1 : 1));
      return key;
    });
  };

  const value = useMemo<AppState>(
    () => ({
      ready,
      screen,
      previousTab,
      characterId,
      nickname,
      coins,
      level,
      xp,
      streakDays,
      survey,
      missions,
      workoutLogs,
      activeMission: missions.find((mission) => mission.id === activeMissionId) ?? missions.find((mission) => mission.kind === 'reps' || mission.kind === 'cardio') ?? null,
      chatPeerId,
      weeklyStepsGoal,
      weeklyStepsCurrent,
      todaySteps,
      stepWeek,
      weeklyBonusClaimed: weeklyBonusWeek === currentWeekKey(),
      pendingWeeklyReward,
      dismissWeeklyReward: () => setPendingWeeklyReward(null),
      ownedItems,
      equippedItem,
      pendingUsername,
      userId,
      token,
      nicknameChanges,
      go: (next) => {
        if (TAB_SCREENS.includes(screen)) setPreviousTab(screen);
        setScreen(next);
      },
      login: async (username, password) => {
        const data = await api.login({ username, password });
        setToken(data.token);
        hydrate(data.user);
        setScreen(data.user.onboarded ? 'home' : 'welcome');
      },
      signup: async (input) => {
        const data = await api.signup(input);
        setPendingUsername(data.username);
        setScreen('login');
      },
      resetPassword: async (input) => {
        await api.resetPassword(input);
        setPendingUsername(input.username);
      },
      logout: () => {
        setToken(null);
        setUserId('');
        setOnboarded(false);
        setNickname('');
        setCoins(0);
        setLevel(1);
        setXp(0);
        setStreakDays(0);
        setStreakDate('');
        setSurvey(defaultSurvey);
        setMissions(defaultMissions);
        setMissionsDate('');
        setWorkoutLogs([]);
        setActiveMissionId(null);
        setChatPeerId(null);
        setOwnedItems(['jacket']);
        setEquippedItem('jacket');
        setWeeklyBonusWeek('');
        weeklyAwardLock.current = '';
        setPendingWeeklyReward(null);
        setCharacterId('otter');
        setNicknameChanges(0);
        setScreen('login');
      },
      saveSurvey: (data) => {
        const key = todayKey();
        const next = {
          ...data,
          workoutDays: data.workoutDays?.length ? data.workoutDays : defaultWorkoutDays(data.frequency),
        };
        setSurvey(next);
        setMissions(pickDailyMissions(next, `${userId || 'guest'}-${key}`));
        setMissionsDate(key);
        // 프로토타입: 프로필에서 설문 다시 해도 캐릭터 선택 → 루틴 흐름을 다시 탐
        setScreen('character');
      },
      updateProfile: async ({ nickname: nextName, survey: nextSurvey }) => {
        if (!token) throw new Error('로그인이 필요해요.');
        const next = {
          ...nextSurvey,
          workoutDays: nextSurvey.workoutDays?.length ? nextSurvey.workoutDays : defaultWorkoutDays(nextSurvey.frequency),
        };
        const data = await api.updateProfile(token, { nickname: nextName.trim(), survey: next });
        setNickname(data.user.nickname);
        setCoins(data.user.coins);
        setNicknameChanges(data.user.nicknameChanges ?? 0);
        setSurvey(next);
        const routineChanged =
          survey.frequency !== next.frequency ||
          survey.places.join() !== next.places.join() ||
          survey.equipment.join() !== next.equipment.join() ||
          survey.experience !== next.experience ||
          survey.workoutDays.join() !== next.workoutDays.join();
        if (routineChanged) {
          const key = todayKey();
          setMissions(pickDailyMissions(next, `${userId || 'guest'}-${key}`));
          setMissionsDate(key);
        }
        setScreen('profile');
      },
      setCharacter: (id) => {
        setCharacterId(id);
      },
      selectCharacter: (id) => {
        setCharacterId(id);
        // 설문/온보딩에서 고른 캐릭터만 기본 보유. 나머지는 도감에서 구매.
        setOwnedItems((prev) => {
          const nonCharacters = prev.filter((item) => !CHARACTER_IDS.includes(item as CharacterId));
          return [...nonCharacters, id];
        });
        setScreen('routine');
      },
      finishOnboarding: () => {
        setOnboarded(true);
        setScreen('home');
      },
      startMission: (id) => {
        const mission = missions.find((item) => item.id === id);
        if (!mission || mission.kind === 'water') return;
        if (TAB_SCREENS.includes(screen)) setPreviousTab(screen);
        setActiveMissionId(id);
        setScreen(mission.kind === 'reps' ? 'pushup' : 'cardio');
      },
      saveMissionProgress: (id, current) => {
        setMissions((prev) =>
          prev.map((mission) => {
            if (mission.id !== id || mission.done) return mission;
            const next = Math.min(mission.goal, Math.max(0, current));
            if (mission.current === next) return mission;
            return { ...mission, current: next, done: false };
          }),
        );
      },
      openChat: (peerId) => {
        if (screen !== 'chat') setPreviousTab(screen);
        setChatPeerId(peerId);
        setScreen('chat');
      },
      addWater: (ml) => {
        let cleared = false;
        setMissions((prev) =>
          prev.map((mission) => {
            if (mission.id !== 'water' && mission.kind !== 'water') return mission;
            const next = +(mission.current + ml / 1000).toFixed(2);
            if (mission.done) return { ...mission, current: Math.min(5, next) };
            const current = Math.min(mission.goal, next);
            const done = current >= mission.goal;
            if (done) {
              cleared = true;
              setCoins((c) => c + (mission.coinReward || 200));
              setXp((x) => applyXp(x, mission.xpReward || 80, () => setLevel((lv) => lv + 1)));
              bumpStreak();
            }
            return { ...mission, current, done };
          }),
        );
        return cleared;
      },
      completeMission: (id, coinReward, xpReward) => {
        setMissions((prev) =>
          prev.map((mission) => {
            if (mission.id !== id || mission.done) return mission;
            setCoins((c) => c + coinReward);
            setXp((x) => applyXp(x, xpReward, () => setLevel((lv) => lv + 1)));
            bumpStreak();
            return { ...mission, current: mission.goal, done: true };
          }),
        );
        setActiveMissionId(null);
        setScreen(TAB_SCREENS.includes(previousTab) ? previousTab : 'home');
      },
      addCoins: (amount) => setCoins((c) => Math.max(0, c + amount)),
      buyItem: (id, price) => {
        if (ownedItems.includes(id)) {
          setEquippedItem(id);
          return true;
        }
        if (coins < price) return false;
        setCoins((c) => Math.max(0, c - price));
        setOwnedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setEquippedItem(id);
        return true;
      },
      equipItem: (id) => {
        if (!ownedItems.includes(id)) return;
        setEquippedItem(id);
      },
      openCoinShop: () => {
        setCoinShopReturn(screen === 'coinShop' ? coinShopReturn : screen);
        setScreen('coinShop');
      },
      closeCoinShop: () => setScreen(coinShopReturn === 'coinShop' ? 'profile' : coinShopReturn),
    }),
    [ready, screen, previousTab, characterId, nickname, coins, level, xp, streakDays, survey, missions, workoutLogs, activeMissionId, chatPeerId, weeklyStepsGoal, weeklyStepsCurrent, todaySteps, stepWeek, weeklyBonusWeek, pendingWeeklyReward, ownedItems, equippedItem, pendingUsername, token, userId, onboarded, nicknameChanges, coinShopReturn],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
