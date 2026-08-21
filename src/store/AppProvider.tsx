import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CharacterId } from '../data/characters';
import { DailyMission, isRolledMission, pickDailyMissions, todayKey } from '../data/missions';
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
  | 'dex'
  | 'friends'
  | 'pushup'
  | 'cardio'
  | 'chat';

export type SurveyData = {
  age: string;
  gender: 'male' | 'female' | null;
  height: string;
  weight: string;
  goalWeight: string;
  places: string[];
  equipment: string[];
  goal: string | null;
  frequency: string | null;
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
  activeMission: Mission | null;
  chatPeerId: string | null;
  weeklyStepsGoal: number;
  weeklyStepsCurrent: number;
  ownedItems: string[];
  pendingUsername: string;
  userId: string;
  token: string | null;
  go: (screen: ScreenName) => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (input: { nickname: string; username: string; password: string }) => Promise<void>;
  resetPassword: (input: { username: string; nickname: string; password: string }) => Promise<void>;
  logout: () => void;
  saveSurvey: (data: SurveyData) => void;
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
};

const STORAGE_KEY = 'mypt-state-v4';
const OVERLAY_SCREENS: ScreenName[] = ['profile', 'dex', 'friends', 'pushup', 'cardio', 'chat'];
const AUTH_SCREENS: ScreenName[] = ['login', 'signup', 'findPassword'];
const TAB_SCREENS: ScreenName[] = ['home', 'quest', 'exercise', 'shop', 'community'];
const CHARACTER_IDS: CharacterId[] = ['otter', 'rabbit', 'cat', 'gorilla', 'dog', 'hamster', 'sloth', 'bear'];

const defaultSurvey: SurveyData = {
  age: '',
  gender: null,
  height: '',
  weight: '',
  goalWeight: '',
  places: [],
  equipment: [],
  goal: null,
  frequency: null,
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
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [chatPeerId, setChatPeerId] = useState<string | null>(null);
  const [weeklyStepsGoal] = useState(50000);
  const [weeklyStepsCurrent] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>(['jacket']);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [onboarded, setOnboarded] = useState(false);
  const [pendingUsername, setPendingUsername] = useState('');

  const hydrate = (user: api.RemoteUser, localDate?: string) => {
    setUserId(user.id);
    setNickname(user.nickname);
    setCoins(user.coins);
    setLevel(user.level);
    setXp(user.xp);
    setStreakDays(user.streakDays);
    setCharacterId(asCharacterId(user.characterId));
    setOnboarded(!!user.onboarded);
    const nextSurvey = user.survey ? { ...defaultSurvey, ...(user.survey as Partial<SurveyData>) } : defaultSurvey;
    setSurvey(nextSurvey);
    const daily = resolveDailyMissions(user, nextSurvey, localDate);
    setMissions(daily.missions);
    setMissionsDate(daily.missionsDate);
    setActiveMissionId(null);
    setChatPeerId(null);
    if (Array.isArray(user.ownedItems)) {
      const next = user.ownedItems.includes('jacket') ? user.ownedItems : ['jacket', ...user.ownedItems];
      setOwnedItems(next.includes(user.characterId) ? next : [...next, user.characterId]);
    } else {
      setOwnedItems(['jacket', user.characterId]);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
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
        ownedItems,
        onboarded,
      }),
    );
    if (token) {
      api
        .saveMe(token, {
          nickname,
          coins,
          level,
          xp,
          streakDays,
          characterId,
          onboarded,
          survey,
          missions,
          missionsDate,
          ownedItems,
        })
        .catch(() => undefined);
    }
  }, [ready, token, screen, previousTab, characterId, nickname, coins, level, xp, streakDays, survey, missions, missionsDate, ownedItems, onboarded]);

  useEffect(() => {
    if (!ready || !onboarded) return;
    const key = todayKey();
    if (missionsDate === key) return;
    setMissions(pickDailyMissions(survey, `${userId || 'guest'}-${key}`));
    setMissionsDate(key);
  }, [ready, onboarded, missionsDate, survey, userId]);

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
      activeMission: missions.find((mission) => mission.id === activeMissionId) ?? missions.find((mission) => mission.kind === 'reps' || mission.kind === 'cardio') ?? null,
      chatPeerId,
      weeklyStepsGoal,
      weeklyStepsCurrent,
      ownedItems,
      pendingUsername,
      userId,
      token,
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
        setSurvey(defaultSurvey);
        setMissions(defaultMissions);
        setMissionsDate('');
        setActiveMissionId(null);
        setChatPeerId(null);
        setOwnedItems(['jacket']);
        setCharacterId('otter');
        setScreen('login');
      },
      saveSurvey: (data) => {
        const key = todayKey();
        setSurvey(data);
        setMissions(pickDailyMissions(data, `${userId || 'guest'}-${key}`));
        setMissionsDate(key);
        setScreen(onboarded ? 'profile' : 'character');
      },
      setCharacter: (id) => {
        setCharacterId(id);
      },
      selectCharacter: (id) => {
        setCharacterId(id);
        setOwnedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
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
        if (TAB_SCREENS.includes(screen)) setPreviousTab(screen);
        setChatPeerId(peerId);
        setScreen('chat');
      },
      addWater: (ml) => {
        let cleared = false;
        setMissions((prev) =>
          prev.map((mission) => {
            if (mission.id !== 'water' || mission.done) return mission;
            const current = Math.min(mission.goal, +(mission.current + ml / 1000).toFixed(2));
            const done = current >= mission.goal;
            if (done) {
              cleared = true;
              setCoins((c) => c + (mission.coinReward || 200));
              setXp((x) => applyXp(x, mission.xpReward || 80, () => setLevel((lv) => lv + 1)));
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
            return { ...mission, current: mission.goal, done: true };
          }),
        );
        setActiveMissionId(null);
        setScreen('home');
      },
      addCoins: (amount) => setCoins((c) => Math.max(0, c + amount)),
      buyItem: (id, price) => {
        if (ownedItems.includes(id)) return true;
        if (coins < price) return false;
        setCoins((c) => Math.max(0, c - price));
        setOwnedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
        return true;
      },
    }),
    [ready, screen, previousTab, characterId, nickname, coins, level, xp, streakDays, survey, missions, activeMissionId, chatPeerId, weeklyStepsGoal, weeklyStepsCurrent, ownedItems, pendingUsername, token, userId, onboarded],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
