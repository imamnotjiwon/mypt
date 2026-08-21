import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4000);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

const defaultMissions = [
  { id: 'water', title: '물 2L 마시기', current: 0, goal: 2, unit: 'L', done: false },
  { id: 'pushup', title: '푸쉬업 30회', current: 0, goal: 30, unit: '회', done: false },
  { id: 'cardio', title: '유산소 30분', current: 0, goal: 30, unit: '분', done: false },
];

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function emptySurvey() {
  return {
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
}

function loadDb() {
  try {
    const db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!Array.isArray(db.users)) db.users = [];
    if (!Array.isArray(db.posts)) db.posts = [];
    if (!Array.isArray(db.friendRequests)) db.friendRequests = [];
    if (!Array.isArray(db.chats)) db.chats = [];
    for (const user of db.users) {
      if (!Array.isArray(user.friendIds)) user.friendIds = [];
    }
    for (const post of db.posts) {
      if (!Array.isArray(post.likedBy)) post.likedBy = [];
      if (!Array.isArray(post.commentItems)) post.commentItems = [];
      for (const item of post.commentItems) {
        if (!Array.isArray(item.likedBy)) item.likedBy = [];
      }
    }
    return db;
  } catch {
    return { users: [], posts: [], friendRequests: [], chats: [] };
  }
}

function friendPreview(user) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    characterId: user.characterId,
    level: user.level,
    streakDays: user.streakDays ?? 0,
  };
}

function areFriends(a, b) {
  return (a.friendIds || []).includes(b.id) && (b.friendIds || []).includes(a.id);
}

function pendingRequest(db, fromId, toId) {
  return db.friendRequests.find((item) => item.fromId === fromId && item.toId === toId) ?? null;
}

function chatPair(a, b) {
  return a < b ? [a, b] : [b, a];
}

function findChat(db, a, b) {
  const [userA, userB] = chatPair(a, b);
  return db.chats.find((item) => item.userA === userA && item.userB === userB) ?? null;
}

function ensureChat(db, a, b) {
  let chat = findChat(db, a, b);
  if (chat) return chat;
  const [userA, userB] = chatPair(a, b);
  chat = { id: crypto.randomUUID(), userA, userB, messages: [] };
  db.chats.push(chat);
  return chat;
}

function saveDb(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored || '').split(':');
    if (!salt || !hash) return false;
    const next = crypto.scryptSync(password, salt, 32).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(next, 'hex'));
  } catch {
    return false;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    coins: user.coins,
    level: user.level,
    xp: user.xp,
    streakDays: user.streakDays,
    characterId: user.characterId,
    onboarded: user.onboarded,
    firstLoginRewarded: user.firstLoginRewarded,
    survey: user.survey,
    missions: user.missions,
    missionsDate: user.missionsDate ?? '',
    ownedItems: user.ownedItems,
  };
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

function findUserByToken(db, req) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  return db.users.find((user) => user.token === token) ?? null;
}

function ensurePostSocial(post) {
  if (!Array.isArray(post.likedBy)) post.likedBy = [];
  if (!Array.isArray(post.commentItems)) post.commentItems = [];
  for (const item of post.commentItems) {
    if (!Array.isArray(item.likedBy)) item.likedBy = [];
  }
  return post;
}

function toggleId(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

function publicComment(item, me) {
  const likedBy = Array.isArray(item.likedBy) ? item.likedBy : [];
  return {
    id: item.id,
    authorId: item.authorId,
    nickname: item.nickname,
    characterId: item.characterId,
    level: item.level,
    text: item.text,
    createdAt: item.createdAt,
    likes: likedBy.length,
    liked: me ? likedBy.includes(me.id) : false,
  };
}

function publicPost(post, me) {
  ensurePostSocial(post);
  return {
    id: post.id,
    authorId: post.authorId,
    nickname: post.nickname,
    characterId: post.characterId,
    level: post.level,
    title: post.title,
    body: post.body,
    photos: post.photos ?? [],
    tab: post.tab,
    visibility: post.visibility ?? 'public',
    likes: post.likedBy.length,
    comments: post.commentItems.length,
    liked: me ? post.likedBy.includes(me.id) : false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function clampPhotos(list) {
  return (Array.isArray(list) ? list : [])
    .filter((item) => typeof item === 'string' && item.startsWith('data:image/'))
    .slice(0, 5)
    .filter((item) => item.length < 900000);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  try {
    if (req.method === 'POST' && url.pathname === '/api/signup') {
      const body = await readBody(req);
      const username = normalizeUsername(body.username);
      const password = String(body.password || '');
      const nickname = String(body.nickname || '').trim();
      if (!/^[a-z0-9]{4,20}$/.test(username)) {
        return send(res, 400, { error: '아이디는 영문/숫자 4~20자로 입력해 주세요.' });
      }
      if (password.length < 4) {
        return send(res, 400, { error: '비밀번호는 4자 이상으로 입력해 주세요.' });
      }
      if (!nickname || nickname.length > 12) {
        return send(res, 400, { error: '닉네임은 1~12자로 입력해 주세요.' });
      }
      const db = loadDb();
      if (db.users.some((user) => user.username === username)) {
        return send(res, 409, { error: '이미 사용 중인 아이디예요.' });
      }
      db.users.push({
        id: crypto.randomUUID(),
        username,
        passwordHash: hashPassword(password),
        nickname,
        coins: 0,
        level: 1,
        xp: 0,
        streakDays: 0,
        characterId: 'otter',
        onboarded: false,
        firstLoginRewarded: false,
        survey: emptySurvey(),
        missions: defaultMissions,
        missionsDate: '',
        ownedItems: ['jacket'],
        friendIds: [],
        token: null,
      });
      saveDb(db);
      return send(res, 201, { ok: true, username });
    }

    if (req.method === 'POST' && url.pathname === '/api/login') {
      const body = await readBody(req);
      const username = normalizeUsername(body.username);
      const password = String(body.password || '');
      const db = loadDb();
      const user = db.users.find((item) => item.username === username);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return send(res, 401, { error: '아이디 또는 비밀번호가 올바르지 않아요.' });
      }
      if (!user.firstLoginRewarded) {
        user.coins = 5000;
        user.firstLoginRewarded = true;
      }
      user.token = crypto.randomBytes(24).toString('hex');
      saveDb(db);
      return send(res, 200, { token: user.token, user: publicUser(user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/password/reset') {
      const body = await readBody(req);
      const username = normalizeUsername(body.username);
      const nickname = String(body.nickname || '').trim();
      const password = String(body.password || '');
      if (password.length < 4) {
        return send(res, 400, { error: '새 비밀번호는 4자 이상으로 입력해 주세요.' });
      }
      const db = loadDb();
      const user = db.users.find((item) => item.username === username && item.nickname === nickname);
      if (!user) {
        return send(res, 404, { error: '아이디와 닉네임이 일치하는 계정이 없어요.' });
      }
      user.passwordHash = hashPassword(password);
      user.token = null;
      saveDb(db);
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/me') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      return send(res, 200, { user: publicUser(user) });
    }

    if (req.method === 'PUT' && url.pathname === '/api/me') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const body = await readBody(req);
      const fields = ['nickname', 'coins', 'level', 'xp', 'streakDays', 'characterId', 'onboarded', 'survey', 'missions', 'missionsDate', 'ownedItems'];
      for (const key of fields) {
        if (body[key] !== undefined) user[key] = body[key];
      }
      saveDb(db);
      return send(res, 200, { user: publicUser(user) });
    }

    if (req.method === 'GET' && url.pathname === '/api/posts') {
      const db = loadDb();
      const me = findUserByToken(db, req);
      const tab = url.searchParams.get('tab');
      const posts = db.posts
        .filter((post) => (tab ? post.tab === tab : true))
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((post) => publicPost(post, me));
      return send(res, 200, { posts });
    }

    if (req.method === 'POST' && url.pathname === '/api/posts') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const body = await readBody(req);
      const tab = body.tab === 'diet' ? 'diet' : 'workout';
      const title = String(body.title || '').trim().slice(0, 30);
      const text = String(body.body || '').trim().slice(0, 1000);
      if (!title && !text) return send(res, 400, { error: '제목이나 내용을 입력해 주세요.' });
      const now = Date.now();
      const post = {
        id: crypto.randomUUID(),
        authorId: user.id,
        nickname: user.nickname,
        characterId: user.characterId,
        level: user.level,
        title: title || (tab === 'diet' ? '식단 공유' : '운동 인증'),
        body: text,
        photos: clampPhotos(body.photos),
        tab,
        visibility: body.visibility === 'friends' ? 'friends' : 'public',
        likedBy: [],
        commentItems: [],
        createdAt: now,
        updatedAt: now,
      };
      db.posts.unshift(post);
      saveDb(db);
      return send(res, 201, { post: publicPost(post, user) });
    }

    const postMatch = url.pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (postMatch && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const post = db.posts.find((item) => item.id === postMatch[1]);
      if (!post) return send(res, 404, { error: '게시물을 찾을 수 없어요.' });
      if (post.authorId !== user.id) return send(res, 403, { error: '내 게시물만 바꿀 수 있어요.' });
      if (req.method === 'DELETE') {
        db.posts = db.posts.filter((item) => item.id !== post.id);
        saveDb(db);
        return send(res, 200, { ok: true });
      }
      const body = await readBody(req);
      if (body.title !== undefined) post.title = String(body.title || '').trim().slice(0, 30) || post.title;
      if (body.body !== undefined) post.body = String(body.body || '').trim().slice(0, 1000);
      if (body.photos !== undefined) post.photos = clampPhotos(body.photos);
      if (body.visibility === 'friends' || body.visibility === 'public') post.visibility = body.visibility;
      post.nickname = user.nickname;
      post.characterId = user.characterId;
      post.level = user.level;
      post.updatedAt = Date.now();
      saveDb(db);
      return send(res, 200, { post: publicPost(post, user) });
    }

    const postLikeMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/like$/);
    if (postLikeMatch && req.method === 'POST') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const post = db.posts.find((item) => item.id === postLikeMatch[1]);
      if (!post) return send(res, 404, { error: '게시물을 찾을 수 없어요.' });
      ensurePostSocial(post);
      post.likedBy = toggleId(post.likedBy, user.id);
      post.updatedAt = Date.now();
      saveDb(db);
      return send(res, 200, { likes: post.likedBy.length, liked: post.likedBy.includes(user.id) });
    }

    const commentsMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (commentsMatch && (req.method === 'GET' || req.method === 'POST')) {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const post = db.posts.find((item) => item.id === commentsMatch[1]);
      if (!post) return send(res, 404, { error: '게시물을 찾을 수 없어요.' });
      ensurePostSocial(post);
      if (req.method === 'GET') {
        return send(res, 200, { comments: post.commentItems.map((item) => publicComment(item, user)) });
      }
      const body = await readBody(req);
      const text = String(body.text || '').trim().slice(0, 500);
      if (!text) return send(res, 400, { error: '댓글을 입력해 주세요.' });
      const item = {
        id: crypto.randomUUID(),
        authorId: user.id,
        nickname: user.nickname,
        characterId: user.characterId,
        level: user.level,
        text,
        createdAt: Date.now(),
        likedBy: [],
      };
      post.commentItems.push(item);
      post.updatedAt = Date.now();
      saveDb(db);
      return send(res, 201, {
        comment: publicComment(item, user),
        comments: post.commentItems.length,
      });
    }

    const commentLikeMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments\/([^/]+)\/like$/);
    if (commentLikeMatch && req.method === 'POST') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const post = db.posts.find((item) => item.id === commentLikeMatch[1]);
      if (!post) return send(res, 404, { error: '게시물을 찾을 수 없어요.' });
      ensurePostSocial(post);
      const item = post.commentItems.find((row) => row.id === commentLikeMatch[2]);
      if (!item) return send(res, 404, { error: '댓글을 찾을 수 없어요.' });
      item.likedBy = toggleId(item.likedBy, user.id);
      saveDb(db);
      return send(res, 200, { likes: item.likedBy.length, liked: item.likedBy.includes(user.id) });
    }

    if (req.method === 'GET' && url.pathname === '/api/friends') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const friends = (user.friendIds || [])
        .map((id) => db.users.find((item) => item.id === id))
        .filter(Boolean)
        .map(friendPreview);
      return send(res, 200, { friends });
    }

    if (req.method === 'GET' && url.pathname === '/api/friends/requests') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const incoming = db.friendRequests
        .filter((item) => item.toId === user.id)
        .map((item) => {
          const from = db.users.find((u) => u.id === item.fromId);
          return from ? { id: item.id, createdAt: item.createdAt, user: friendPreview(from) } : null;
        })
        .filter(Boolean);
      const outgoing = db.friendRequests
        .filter((item) => item.fromId === user.id)
        .map((item) => {
          const to = db.users.find((u) => u.id === item.toId);
          return to ? { id: item.id, createdAt: item.createdAt, user: friendPreview(to) } : null;
        })
        .filter(Boolean);
      return send(res, 200, { incoming, outgoing });
    }

    if (req.method === 'GET' && url.pathname === '/api/friends/search') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
      if (!q) return send(res, 400, { error: '닉네임이나 아이디를 입력해 주세요.' });
      const results = db.users
        .filter((item) => item.id !== user.id)
        .filter((item) => item.nickname.toLowerCase().includes(q) || item.username.includes(q))
        .slice(0, 20)
        .map((item) => {
          const incoming = pendingRequest(db, item.id, user.id);
          const outgoing = pendingRequest(db, user.id, item.id);
          let relation = 'none';
          if (areFriends(user, item)) relation = 'friends';
          else if (incoming) relation = 'incoming';
          else if (outgoing) relation = 'outgoing';
          return { ...friendPreview(item), relation, requestId: incoming?.id || outgoing?.id || null };
        });
      return send(res, 200, { users: results });
    }

    if (req.method === 'POST' && url.pathname === '/api/friends/request') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const body = await readBody(req);
      const targetId = String(body.userId || '').trim();
      const query = String(body.query || '').trim().toLowerCase();
      const target = targetId
        ? db.users.find((item) => item.id === targetId)
        : db.users.find((item) => item.username === query || item.nickname.toLowerCase() === query);
      if (!target || target.id === user.id) {
        return send(res, 404, { error: '사용자를 찾을 수 없어요.' });
      }
      if (areFriends(user, target)) {
        return send(res, 409, { error: '이미 친구예요.' });
      }
      const reverse = pendingRequest(db, target.id, user.id);
      if (reverse) {
        user.friendIds = Array.from(new Set([...(user.friendIds || []), target.id]));
        target.friendIds = Array.from(new Set([...(target.friendIds || []), user.id]));
        db.friendRequests = db.friendRequests.filter((item) => item.id !== reverse.id);
        saveDb(db);
        return send(res, 200, { ok: true, accepted: true });
      }
      if (pendingRequest(db, user.id, target.id)) {
        return send(res, 409, { error: '이미 친구 요청을 보냈어요.' });
      }
      db.friendRequests.push({
        id: crypto.randomUUID(),
        fromId: user.id,
        toId: target.id,
        createdAt: Date.now(),
      });
      saveDb(db);
      return send(res, 201, { ok: true, accepted: false });
    }

    if (req.method === 'POST' && url.pathname === '/api/friends/accept') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const body = await readBody(req);
      const request = db.friendRequests.find((item) => item.id === String(body.requestId || '') && item.toId === user.id);
      if (!request) return send(res, 404, { error: '친구 요청을 찾을 수 없어요.' });
      const from = db.users.find((item) => item.id === request.fromId);
      if (!from) {
        db.friendRequests = db.friendRequests.filter((item) => item.id !== request.id);
        saveDb(db);
        return send(res, 404, { error: '상대 계정을 찾을 수 없어요.' });
      }
      user.friendIds = Array.from(new Set([...(user.friendIds || []), from.id]));
      from.friendIds = Array.from(new Set([...(from.friendIds || []), user.id]));
      db.friendRequests = db.friendRequests.filter(
        (item) =>
          item.id !== request.id &&
          !((item.fromId === user.id && item.toId === from.id) || (item.fromId === from.id && item.toId === user.id)),
      );
      saveDb(db);
      return send(res, 200, { ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/friends/decline') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const body = await readBody(req);
      const requestId = String(body.requestId || '');
      const request = db.friendRequests.find((item) => item.id === requestId);
      if (!request || (request.toId !== user.id && request.fromId !== user.id)) {
        return send(res, 404, { error: '친구 요청을 찾을 수 없어요.' });
      }
      db.friendRequests = db.friendRequests.filter((item) => item.id !== request.id);
      saveDb(db);
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/chats') {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const threads = db.chats
        .filter((chat) => chat.userA === user.id || chat.userB === user.id)
        .map((chat) => {
          const peerId = chat.userA === user.id ? chat.userB : chat.userA;
          const peer = db.users.find((item) => item.id === peerId);
          const last = chat.messages[chat.messages.length - 1] ?? null;
          return {
            peer: peer ? friendPreview(peer) : null,
            lastMessage: last
              ? { id: last.id, fromId: last.fromId, text: last.text, createdAt: last.createdAt, mine: last.fromId === user.id }
              : null,
          };
        })
        .filter((row) => row.peer)
        .sort((a, b) => (b.lastMessage?.createdAt ?? 0) - (a.lastMessage?.createdAt ?? 0));
      const friendRows = (user.friendIds || [])
        .map((id) => db.users.find((item) => item.id === id))
        .filter(Boolean)
        .filter((friend) => !threads.some((row) => row.peer.id === friend.id))
        .map((friend) => ({ peer: friendPreview(friend), lastMessage: null }));
      return send(res, 200, { chats: [...threads, ...friendRows] });
    }

    const chatMatch = url.pathname.match(/^\/api\/chats\/([^/]+)$/);
    if (chatMatch && (req.method === 'GET' || req.method === 'POST')) {
      const db = loadDb();
      const user = findUserByToken(db, req);
      if (!user) return send(res, 401, { error: '로그인이 필요해요.' });
      const peer = db.users.find((item) => item.id === decodeURIComponent(chatMatch[1]));
      if (!peer) return send(res, 404, { error: '상대를 찾을 수 없어요.' });
      if (!areFriends(user, peer)) return send(res, 403, { error: '친구가 된 뒤에 채팅할 수 있어요.' });
      if (req.method === 'GET') {
        const chat = findChat(db, user.id, peer.id);
        return send(res, 200, {
          peer: friendPreview(peer),
          messages: (chat?.messages ?? []).map((item) => ({
            id: item.id,
            fromId: item.fromId,
            text: item.text,
            createdAt: item.createdAt,
            mine: item.fromId === user.id,
          })),
        });
      }
      const body = await readBody(req);
      const text = String(body.text || '').trim();
      if (!text) return send(res, 400, { error: '메시지를 입력해 주세요.' });
      const chat = ensureChat(db, user.id, peer.id);
      const message = { id: crypto.randomUUID(), fromId: user.id, text: text.slice(0, 1000), createdAt: Date.now() };
      chat.messages.push(message);
      saveDb(db);
      return send(res, 201, {
        message: { id: message.id, fromId: message.fromId, text: message.text, createdAt: message.createdAt, mine: true },
      });
    }

    send(res, 404, { error: '없는 요청이에요.' });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: '서버 오류가 났어요.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`mypt server http://localhost:${PORT}`);
  console.log(`phone / LAN   http://0.0.0.0:${PORT}`);
});
