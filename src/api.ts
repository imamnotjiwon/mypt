import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

const API_BASE = resolveApiBase();

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
};

type ApiError = { error?: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error('서버에 연결할 수 없어요. 터미널에서 npm run server 를 실행해 주세요.');
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
