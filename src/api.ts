import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL_KEY = 'mypt.apiUrl';
const REMOTE_CONFIG = 'https://imamnotjiwon.github.io/mypt/api-config.json';

function resolveApiBase() {
  if (Platform.OS === 'web') return 'http://localhost:4000';
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const extra = Constants.expoConfig?.extra?.apiUrl;
  if (typeof extra === 'string' && extra) return extra.replace(/\/$/, '');
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:4000`;
  }
  return 'http://localhost:4000';
}

let apiBase = resolveApiBase();

export async function initApiBase() {
  if (Platform.OS === 'web') return apiBase;

  // Dev/tunnel session: EXPO_PUBLIC_API_URL wins so phones off LAN
  // (and any Expo account) keep the live public API, not a stale Pages URL.
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    apiBase = fromEnv;
    try {
      await AsyncStorage.setItem(API_URL_KEY, apiBase);
    } catch {
      /* ignore */
    }
    return apiBase;
  }

  try {
    const cached = await AsyncStorage.getItem(API_URL_KEY);
    if (cached) apiBase = cached.replace(/\/$/, '');
  } catch {
    /* keep baked URL */
  }
  // 캐시가 있으면 즉시 쓰고, 원격 설정은 짧게만 시도 (느린 터널에서 부팅 지연 방지)
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1200);
    const res = await fetch(`${REMOTE_CONFIG}?t=${Date.now()}`, { signal: ctrl.signal });
    clearTimeout(timer);
    const data = (await res.json()) as { apiUrl?: string };
    if (typeof data.apiUrl === 'string' && /^https?:\/\//.test(data.apiUrl)) {
      apiBase = data.apiUrl.replace(/\/$/, '');
      await AsyncStorage.setItem(API_URL_KEY, apiBase);
    }
  } catch {
    /* use cache or baked URL */
  }
  return apiBase;
}

export type RemoteUser = {
  id: string;
  username: string;
  nickname: string;
  coins: number;
  level: number;
  xp: number;
  streakDays: number;
  characterId: string;
  onboarded: boolean;
  firstLoginRewarded: boolean;
  survey: Record<string, unknown>;
  missions: unknown;
  missionsDate?: string;
  ownedItems: string[];
  workoutLogs?: unknown[];
  streakDate?: string;
  equippedItem?: string;
  weeklyBonusWeek?: string;
  nicknameChanges?: number;
};

type ApiError = { error?: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'mypt-app',
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error('서버에 연결할 수 없어요. 컴퓨터에서 npm run server:public 을 실행해 주세요.');
  }
  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok) throw new Error(data.error || '요청에 실패했어요.');
  return data;
}

export function signup(input: { username: string; password: string; nickname: string }) {
  return request<{ ok: true; username: string }>('/api/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input: { username: string; password: string }) {
  return request<{ token: string; user: RemoteUser }>('/api/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function resetPassword(input: { username: string; nickname: string; password: string }) {
  return request<{ ok: true }>('/api/password/reset', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getMe(token: string) {
  return request<{ user: RemoteUser }>('/api/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function saveMe(token: string, user: Partial<RemoteUser>) {
  return request<{ user: RemoteUser }>('/api/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(user),
  });
}

export function updateProfile(token: string, input: { nickname: string; survey: Record<string, unknown> }) {
  return request<{ user: RemoteUser; nicknameCost: number }>('/api/profile', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export type RemotePost = {
  id: string;
  authorId: string;
  nickname: string;
  characterId: string;
  level: number;
  title: string;
  body: string;
  photos: string[];
  tab: 'workout' | 'diet';
  visibility: 'public' | 'friends';
  likes: number;
  comments: number;
  liked?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type RemoteComment = {
  id: string;
  authorId: string;
  nickname: string;
  characterId: string;
  level: number;
  text: string;
  createdAt: number;
  likes: number;
  liked: boolean;
};

export function listPosts(tab?: 'workout' | 'diet', token?: string) {
  const query = tab ? `?tab=${tab}` : '';
  return request<{ posts: RemotePost[] }>(`/api/posts${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function createPost(
  token: string,
  input: { title: string; body: string; photos: string[]; tab: 'workout' | 'diet'; visibility: 'public' | 'friends' },
) {
  return request<{ post: RemotePost }>('/api/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export function updatePost(
  token: string,
  id: string,
  input: { title: string; body: string; photos: string[]; visibility?: 'public' | 'friends' },
) {
  return request<{ post: RemotePost }>(`/api/posts/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export function deletePost(token: string, id: string) {
  return request<{ ok: true }>(`/api/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function togglePostLike(token: string, id: string) {
  return request<{ likes: number; liked: boolean }>(`/api/posts/${id}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listPostComments(token: string, postId: string) {
  return request<{ comments: RemoteComment[] }>(`/api/posts/${postId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addPostComment(token: string, postId: string, text: string) {
  return request<{ comment: RemoteComment; comments: number }>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  });
}

export function toggleCommentLike(token: string, postId: string, commentId: string) {
  return request<{ likes: number; liked: boolean }>(`/api/posts/${postId}/comments/${commentId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type FriendPreview = {
  id: string;
  username: string;
  nickname: string;
  characterId: string;
  level: number;
  streakDays: number;
};

export type FriendRelation = 'none' | 'friends' | 'incoming' | 'outgoing';

export type FriendSearchHit = FriendPreview & {
  relation: FriendRelation;
  requestId: string | null;
};

export type FriendRequestRow = {
  id: string;
  createdAt: number;
  user: FriendPreview;
};

export function listFriends(token: string) {
  return request<{ friends: FriendPreview[] }>('/api/friends', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listFriendRequests(token: string) {
  return request<{ incoming: FriendRequestRow[]; outgoing: FriendRequestRow[] }>('/api/friends/requests', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function searchUsers(token: string, q: string) {
  return request<{ users: FriendSearchHit[] }>(`/api/friends/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function suggestFriends(token: string) {
  return request<{ users: FriendSearchHit[] }>('/api/friends/suggest', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function sendFriendRequest(token: string, input: { userId?: string; query?: string }) {
  return request<{ ok: true; accepted: boolean }>('/api/friends/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export function acceptFriendRequest(token: string, requestId: string) {
  return request<{ ok: true }>('/api/friends/accept', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ requestId }),
  });
}

export function declineFriendRequest(token: string, requestId: string) {
  return request<{ ok: true }>('/api/friends/decline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ requestId }),
  });
}

export type ChatMessage = {
  id: string;
  fromId: string;
  text: string;
  createdAt: number;
  mine: boolean;
};

export type ChatThread = {
  peer: FriendPreview;
  lastMessage: ChatMessage | null;
};

export function listChats(token: string) {
  return request<{ chats: ChatThread[] }>('/api/chats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listChatMessages(token: string, peerId: string) {
  return request<{ peer: FriendPreview; messages: ChatMessage[] }>(`/api/chats/${peerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function sendChatMessage(token: string, peerId: string, text: string) {
  return request<{ message: ChatMessage }>(`/api/chats/${peerId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  });
}
