import { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { CommunityCompose } from '../components/CommunityCompose';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchMark } from '../components/Marks';
import { CHARACTERS, Character, asCharacterHead, getCharacter } from '../data/characters';
import { useApp } from '../store/AppProvider';
import * as api from '../api';
import { useAppInsets } from '../hooks/useAppInsets';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { colors, fieldFont, font, layout, shadow, space } from '../theme';

type Tab = 'workout' | 'diet' | 'message';

type Post = {
  id: string;
  authorId?: string;
  user: Character;
  nickname: string;
  level: number;
  title: string;
  body: string;
  time: string;
  likes: number;
  comments: number;
  liked?: boolean;
  photos: string[];
  photo?: ImageSourcePropType;
  tab: Tab;
};

type CommentItem = {
  id: string;
  user: Character;
  level: number;
  text: string;
  time: string;
  likes: number;
  liked?: boolean;
};

function matchesQuery(haystack: string, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle);
}

function timeAgo(ts: number) {
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function fromRemote(post: api.RemotePost): Post {
  const user = CHARACTERS.find((item) => item.id === post.characterId) ?? CHARACTERS[0];
  const photos = Array.isArray(post.photos) ? post.photos : [];
  return {
    id: post.id,
    authorId: post.authorId,
    user,
    nickname: post.nickname,
    level: post.level,
    title: post.title,
    body: post.body,
    time: timeAgo(post.createdAt),
    likes: post.likes,
    comments: post.comments,
    liked: !!post.liked,
    photos,
    photo: photos[0] ? { uri: photos[0] } : undefined,
    tab: post.tab,
  };
}

function fromRemoteComment(item: api.RemoteComment): CommentItem {
  const character = CHARACTERS.find((row) => row.id === item.characterId) ?? CHARACTERS[0];
  return {
    id: item.id,
    user: { ...character, nickname: item.nickname },
    level: item.level,
    text: item.text,
    time: timeAgo(item.createdAt),
    likes: item.likes,
    liked: item.liked,
  };
}

function PostPhoto({ source }: { source: ImageSourcePropType }) {
  const [ratio, setRatio] = useState(1);
  useEffect(() => {
    const uri =
      typeof source === 'object' && source && !Array.isArray(source) && 'uri' in source
        ? source.uri
        : undefined;
    if (!uri) {
      const resolved = Image.resolveAssetSource(source);
      if (resolved?.width && resolved?.height) {
        setRatio(Math.max(0.75, Math.min(1.91, resolved.width / resolved.height)));
      }
      return;
    }
    Image.getSize(
      uri,
      (w, h) => {
        if (w > 0 && h > 0) setRatio(Math.max(0.75, Math.min(1.91, w / h)));
      },
      () => setRatio(1),
    );
  }, [source]);
  return (
    <View style={styles.photoWrap}>
      <Image source={source} style={[styles.photo, { aspectRatio: ratio }]} resizeMode="contain" />
    </View>
  );
}

function HeartIcon({ on, size = 18 }: { on: boolean; size?: number }) {
  return (
    <AppText
      style={{
        fontFamily: font.bold,
        fontSize: size,
        lineHeight: size + 2,
        color: on ? '#E35D5D' : '#ABADAF',
        backgroundColor: 'transparent',
        width: size,
        textAlign: 'center',
      }}
    >
      ♥
    </AppText>
  );
}

function ActionBar({
  liked,
  likes,
  comments,
  onLike,
  onComment,
}: {
  liked: boolean;
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
}) {
  return (
    <View style={styles.actions}>
      <Pressable
        style={({ pressed }) => [styles.stat, pressed && { opacity: 0.65 }]}
        onPress={onLike}
        hitSlop={12}
      >
        <HeartIcon on={liked} />
        <AppText style={[styles.statText, liked && styles.statOn]}>{likes}</AppText>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.stat, pressed && { opacity: 0.65 }]} onPress={onComment} hitSlop={12}>
        <Image source={require('../../assets/community/comment.png')} style={styles.actionIcon} resizeMode="contain" />
        <AppText style={styles.statText}>{comments}</AppText>
      </Pressable>
    </View>
  );
}

function PostCard({
  post,
  liked,
  likes,
  comments,
  mine,
  menuOpen,
  onLike,
  onOpen,
  onMenu,
  onEdit,
  onDelete,
}: {
  post: Post;
  liked: boolean;
  likes: number;
  comments: number;
  mine: boolean;
  menuOpen: boolean;
  onLike: () => void;
  onOpen: () => void;
  onMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.post}>
      <View style={styles.userRow}>
        <Pressable style={styles.userHit} onPress={onOpen}>
          <Image source={post.user.head} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.userName}>{post.nickname}</AppText>
            <AppText style={styles.level}>LV.{post.level}</AppText>
          </View>
        </Pressable>
        {mine ? (
          <Pressable style={styles.meatball} onPress={onMenu} hitSlop={12}>
            <AppText style={styles.meatballTxt}>⋮</AppText>
          </Pressable>
        ) : null}
      </View>
      {menuOpen ? (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={onEdit}>
            <AppText style={styles.menuTxt}>수정</AppText>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={onDelete}>
            <AppText style={styles.menuDanger}>삭제</AppText>
          </Pressable>
        </View>
      ) : null}
      <Pressable onPress={onOpen}>
        <AppText style={styles.postTitle}>{post.title}</AppText>
        <AppText style={styles.postBody}>{post.body}</AppText>
        <AppText style={styles.time}>{post.time}</AppText>
        {post.photo ? <PostPhoto source={post.photo} /> : null}
      </Pressable>
      <ActionBar liked={liked} likes={likes} comments={comments} onLike={onLike} onComment={onOpen} />
    </View>
  );
}

function PostDetail({
  post,
  me,
  token,
  liked,
  likes,
  comments,
  onLike,
  onCommentsChange,
  onBack,
}: {
  post: Post;
  me: Character;
  token: string | null;
  liked: boolean;
  likes: number;
  comments: number;
  onLike: () => void;
  onCommentsChange: (count: number) => void;
  onBack: () => void;
}) {
  const { top, bottom } = useAppInsets();
  const keyboard = useKeyboardInset();
  const remote = !!post.authorId;
  const [list, setList] = useState<CommentItem[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token || !remote) {
      setList([]);
      return;
    }
    let live = true;
    api
      .listPostComments(token, post.id)
      .then((data) => {
        if (!live) return;
        setList(data.comments.map(fromRemoteComment));
      })
      .catch(() => {
        if (live) setList([]);
      });
    return () => {
      live = false;
    };
  }, [post.id, token, remote]);

  const toggleCommentHeart = async (item: CommentItem) => {
    if (token && remote) {
      try {
        const result = await api.toggleCommentLike(token, post.id, item.id);
        setList((prev) => prev.map((row) => (row.id === item.id ? { ...row, liked: result.liked, likes: result.likes } : row)));
        return;
      } catch {
        undefined;
      }
    }
    setList((prev) =>
      prev.map((row) => {
        if (row.id !== item.id) return row;
        const on = !row.liked;
        return { ...row, liked: on, likes: row.likes + (on ? 1 : -1) };
      }),
    );
  };

  const submitComment = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setDraft('');
    try {
      if (token && remote) {
        const { comment, comments: count } = await api.addPostComment(token, post.id, text);
        setList((prev) => [...prev, fromRemoteComment(comment)]);
        onCommentsChange(count);
      } else {
        setList((prev) => [
          ...prev,
          { id: `mine-${prev.length}`, user: me, level: 32, text, time: '방금', likes: 0, liked: false },
        ]);
        onCommentsChange(comments + 1);
      }
    } catch {
      setDraft(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.detail}>
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <View style={[styles.detailTop, { paddingTop: top }]}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <AppText style={styles.backTxt}>‹</AppText>
          </Pressable>
          <AppText variant="title" style={styles.detailTitle}>
            {post.tab === 'diet' ? '식단 공유' : '운동 인증'}
          </AppText>
          <View style={styles.backBtn} />
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={[styles.userRow, styles.detailUser]}>
              <Image source={post.user.head} style={styles.avatar} />
              <View>
                <AppText style={styles.userName}>{post.nickname}</AppText>
                <AppText style={styles.level}>LV.{post.level}</AppText>
              </View>
            </View>
            <AppText style={styles.postTitle}>{post.title}</AppText>
            <AppText style={styles.postBody}>{post.body}</AppText>
            <AppText style={styles.time}>{post.time}</AppText>
            {post.photo ? <PostPhoto source={post.photo} /> : null}
            <ActionBar liked={liked} likes={likes} comments={comments} onLike={onLike} onComment={() => undefined} />
            <View style={styles.divider} />
            {list.map((item) => (
                <View key={item.id} style={styles.comment}>
                  <Image source={item.user.head} style={styles.commentAvatar} />
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.commentName}>
                      {item.user.nickname} <AppText style={styles.level}>LV.{item.level}</AppText>
                    </AppText>
                    <AppText style={styles.commentText}>{item.text}</AppText>
                    <View style={styles.commentMeta}>
                      <AppText style={styles.timeInline}>{item.time}</AppText>
                    </View>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.commentLike, pressed && { opacity: 0.65 }]}
                    onPress={() => toggleCommentHeart(item)}
                    hitSlop={12}
                  >
                    <HeartIcon on={!!item.liked} size={14} />
                    <AppText style={[styles.statText, item.liked && styles.statOn]}>{item.likes}</AppText>
                  </Pressable>
                </View>
              ))}
          </ScrollView>
          <View style={[styles.composer, { paddingBottom: 10 + (keyboard > 0 ? 8 : bottom) + keyboard }]}>
            <Image source={me.head} style={styles.commentAvatar} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#B0B4B8"
              selectionColor={colors.navy}
              underlineColorAndroid="transparent"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={submitComment}
            />
            <Pressable style={styles.send} onPress={submitComment} disabled={busy} hitSlop={8}>
              <AppText style={styles.sendTxt}>등록</AppText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function CommunityScreen() {
  const { go, openChat, nickname, coins, characterId, level, addCoins, token, userId } = useApp();
  const { top, navHeight, navInset } = useAppInsets();
  const [tab, setTab] = useState<Tab>('workout');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [composeKind, setComposeKind] = useState<'workout' | 'diet'>('workout');
  const [editing, setEditing] = useState<Post | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCount, setLikeCount] = useState<Record<string, number>>({});
  const [commentCount, setCommentCount] = useState<Record<string, number>>({});
  const [chats, setChats] = useState<api.ChatThread[]>([]);
  const [pickFriend, setPickFriend] = useState(false);
  const [pickList, setPickList] = useState<api.FriendPreview[]>([]);
  const me = { ...getCharacter(characterId), nickname };
  const allPosts = userPosts;
  const query = searchOpen ? searchQuery : '';
  const feed = allPosts.filter((p) => p.tab === tab && matchesQuery(`${p.nickname} ${p.title} ${p.body}`, query));
  const chatFeed = chats.filter((row) =>
    matchesQuery(`${row.peer.nickname} ${row.lastMessage?.text ?? ''}`, query),
  );
  const openPost = allPosts.find((p) => p.id === openId) ?? null;

  useEffect(() => {
    let live = true;
    api
      .listPosts(undefined, token ?? undefined)
      .then(({ posts }) => {
        if (!live) return;
        const mapped = posts.map(fromRemote);
        setUserPosts((prev) => {
          const seen = new Set(mapped.map((item) => item.id));
          return [...prev.filter((item) => item.id.startsWith('local-') && !seen.has(item.id)), ...mapped];
        });
        setLiked((prev) => ({ ...prev, ...Object.fromEntries(mapped.map((item) => [item.id, !!item.liked])) }));
        setLikeCount((prev) => ({ ...prev, ...Object.fromEntries(mapped.map((item) => [item.id, item.likes])) }));
        setCommentCount((prev) => ({ ...prev, ...Object.fromEntries(mapped.map((item) => [item.id, item.comments])) }));
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [token]);

  useEffect(() => {
    if (tab !== 'message' || !token) return;
    api.listChats(token).then((data) => setChats(data.chats)).catch(() => setChats([]));
  }, [tab, token]);

  useEffect(() => {
    if (!pickFriend || !token) return;
    api.listFriends(token).then((data) => setPickList(data.friends)).catch(() => setPickList([]));
  }, [pickFriend, token]);

  const toggleLike = async (post: Post) => {
    if (token && post.authorId) {
      try {
        const result = await api.togglePostLike(token, post.id);
        setLiked((prev) => ({ ...prev, [post.id]: result.liked }));
        setLikeCount((prev) => ({ ...prev, [post.id]: result.likes }));
        setUserPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, likes: result.likes, liked: result.liked } : item)));
        return;
      } catch {
        undefined;
      }
    }
    setLiked((prev) => {
      const next = !prev[post.id];
      setLikeCount((counts) => ({
        ...counts,
        [post.id]: (counts[post.id] ?? post.likes) + (next ? 1 : -1),
      }));
      return { ...prev, [post.id]: next };
    });
  };

  const closeCompose = () => {
    setCompose(false);
    setEditing(null);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: navInset }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.headerBleed}>
            <ScreenHeader
              nickname={nickname}
              coins={coins}
              characterId={characterId}
              onPressProfile={() => go('profile')}
              onPressSearch={() => {
                setSearchOpen((open) => {
                  if (open) setSearchQuery('');
                  return !open;
                });
              }}
              searchActive={searchOpen}
              compact
            />
          </View>
          {searchOpen ? (
            <View style={styles.searchBar}>
              <SearchMark size={16} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={tab === 'message' ? '닉네임 또는 대화 내용 검색' : '닉네임, 제목, 내용 검색'}
                placeholderTextColor="#B0B4B8"
                selectionColor={colors.navy}
                underlineColorAndroid="transparent"
                autoFocus
                style={styles.searchInput}
              />
            </View>
          ) : null}
          <View style={styles.tabs}>
          {(
            [
              { id: 'workout', label: '운동 인증' },
              { id: 'diet', label: '식단 공유' },
              { id: 'message', label: '메세지' },
            ] as const
          ).map((item) => (
            <Pressable key={item.id} onPress={() => setTab(item.id)} style={[styles.tab, tab === item.id && styles.tabOn]}>
              <AppText style={[styles.tabText, tab === item.id && styles.tabOnText]} numberOfLines={1}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>

          {tab === 'message'
            ? chatFeed.length === 0
              ? (
                <View style={styles.empty}>
                  <AppText style={styles.emptyTitle}>
                    {query.trim() ? '검색 결과가 없어요' : '아직 채팅이 없어요'}
                  </AppText>
                  <AppText style={styles.emptyHint}>
                    {query.trim()
                      ? '다른 닉네임이나 내용으로 다시 찾아 보세요'
                      : '친구를 추가한 뒤 오른쪽 아래 버튼으로 대화를 시작해 보세요!'}
                  </AppText>
                </View>
              )
              : chatFeed.map((row) => (
                <Pressable key={row.peer.id} style={styles.chatCard} onPress={() => openChat(row.peer.id)}>
                  <View>
                    <Image source={asCharacterHead(row.peer.characterId)} style={styles.avatar} />
                    <View style={styles.online} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.userName}>{row.peer.nickname}</AppText>
                    <AppText style={styles.msgText} numberOfLines={1}>
                      {row.lastMessage
                        ? `${row.lastMessage.mine ? '회원님: ' : ''}${row.lastMessage.text}`
                        : '대화를 시작해 보세요'}
                    </AppText>
                  </View>
                  <AppText style={styles.chatTime}>{row.lastMessage ? timeAgo(row.lastMessage.createdAt) : ''}</AppText>
                </Pressable>
              ))
            : feed.length === 0
              ? (
                <View style={styles.empty}>
                  <AppText style={styles.emptyTitle}>
                    {query.trim() ? '검색 결과가 없어요' : tab === 'diet' ? '아직 식단 공유가 없어요' : '아직 운동 인증이 없어요'}
                  </AppText>
                  <AppText style={styles.emptyHint}>
                    {query.trim()
                      ? '다른 닉네임이나 내용으로 다시 찾아 보세요'
                      : '오른쪽 아래 연필 버튼으로 게시물을 올려 보세요!'}
                  </AppText>
                </View>
              )
              : feed.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={!!liked[post.id]}
                  likes={likeCount[post.id] ?? post.likes}
                  comments={commentCount[post.id] ?? post.comments}
                  mine={!!post.authorId && post.authorId === userId}
                  menuOpen={menuId === post.id}
                  onLike={() => toggleLike(post)}
                  onOpen={() => {
                    setMenuId(null);
                    setOpenId(post.id);
                  }}
                  onMenu={() => setMenuId((id) => (id === post.id ? null : post.id))}
                  onEdit={() => {
                    setMenuId(null);
                    setComposeKind(post.tab === 'diet' ? 'diet' : 'workout');
                    setEditing(post);
                    setCompose(true);
                  }}
                  onDelete={async () => {
                    if (!token) return;
                    const ok = typeof window !== 'undefined' ? window.confirm('이 게시물을 삭제할까요?') : true;
                    if (!ok) return;
                    try {
                      await api.deletePost(token, post.id);
                      setUserPosts((prev) => prev.filter((item) => item.id !== post.id));
                      setMenuId(null);
                      if (openId === post.id) setOpenId(null);
                    } catch {
                      undefined;
                    }
                  }}
                />
              ))}
        </ScrollView>
      </SafeAreaView>
      {tab === 'message' && !openPost && !compose ? (
        <Pressable style={[styles.chatFab, { bottom: navHeight + 12 }]} onPress={() => setPickFriend(true)}>
          <AppText style={styles.chatFabTxt}>+</AppText>
        </Pressable>
      ) : null}
      {tab !== 'message' && !openPost && !compose ? (
        <Pressable
          style={[styles.fab, { bottom: navHeight + 12 }]}
          onPress={() => {
            if (tab !== 'workout' && tab !== 'diet') return;
            setEditing(null);
            setComposeKind(tab);
            setCompose(true);
          }}
        >
          <Image source={require('../../assets/community/fab-pen.png')} style={styles.fabImg} />
        </Pressable>
      ) : null}
      {openPost ? (
        <PostDetail
          post={openPost}
          me={me}
          token={token}
          liked={!!liked[openPost.id]}
          likes={likeCount[openPost.id] ?? openPost.likes}
          comments={commentCount[openPost.id] ?? openPost.comments}
          onLike={() => toggleLike(openPost)}
          onCommentsChange={(count) => {
            setCommentCount((prev) => ({ ...prev, [openPost.id]: count }));
            setUserPosts((prev) => prev.map((item) => (item.id === openPost.id ? { ...item, comments: count } : item)));
          }}
          onBack={() => setOpenId(null)}
        />
      ) : null}
      {compose ? (
        <CommunityCompose
          kind={composeKind}
          me={me}
          level={level}
          initial={editing ? { title: editing.title, body: editing.body, photos: editing.photos } : undefined}
          onClose={closeCompose}
          onPublish={async ({ title, body, photos, visibility }) => {
            if (!token) throw new Error('로그인이 필요해요.');
            if (editing) {
              const { post } = await api.updatePost(token, editing.id, { title, body, photos, visibility });
              const mapped = fromRemote(post);
              setUserPosts((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
              closeCompose();
              setTab(composeKind);
              return;
            }
            const optimistic: Post = {
              id: `local-${Date.now()}`,
              authorId: userId,
              user: me,
              nickname,
              level,
              title,
              body,
              time: '방금',
              likes: 0,
              comments: 0,
              photos,
              photo: photos[0] ? { uri: photos[0] } : undefined,
              tab: composeKind,
            };
            setUserPosts((prev) => [optimistic, ...prev]);
            closeCompose();
            setTab(composeKind);
            try {
              const { post } = await api.createPost(token, {
                title,
                body,
                photos,
                tab: composeKind,
                visibility,
              });
              const mapped = fromRemote(post);
              setUserPosts((prev) => [mapped, ...prev.filter((item) => item.id !== optimistic.id && item.id !== mapped.id)]);
              addCoins(100);
            } catch {
              undefined;
            }
          }}
        />
      ) : null}
      {pickFriend ? (
        <View style={styles.picker}>
          <SafeAreaView style={{ flex: 1, paddingTop: top }} edges={[]}>
            <View style={styles.detailTop}>
              <Pressable style={styles.backBtn} onPress={() => setPickFriend(false)}>
                <AppText style={styles.backTxt}>‹</AppText>
              </Pressable>
              <AppText style={styles.detailTitle}>친구와 채팅</AppText>
              <View style={styles.backBtn} />
            </View>
            <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
              {pickList.length === 0 ? (
                <View style={styles.empty}>
                  <AppText style={styles.emptyTitle}>채팅할 친구가 없어요</AppText>
                  <Pressable onPress={() => { setPickFriend(false); go('friends'); }} hitSlop={12}>
                    <AppText style={styles.emptyHint}>친구 추가하러 가기</AppText>
                  </Pressable>
                </View>
              ) : (
                pickList.map((friend) => (
                  <Pressable
                    key={friend.id}
                    style={({ pressed }) => [styles.chatCard, pressed && { opacity: 0.8 }]}
                    onPress={() => {
                      setPickFriend(false);
                      openChat(friend.id);
                    }}
                  >
                    <Image source={asCharacterHead(friend.characterId)} style={styles.avatar} />
                    <AppText style={styles.userName}>{friend.nickname}</AppText>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      ) : null}
      {openPost || compose || pickFriend ? null : <BottomNav active="community" onChange={go} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  headerBleed: { marginHorizontal: -layout.screen },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.sky,
    paddingHorizontal: 14,
    marginBottom: space[8],
  },
  searchInput: {
    flex: 1,
    ...fieldFont,
    fontSize: 14,
    color: colors.text,
    height: 44,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: layout.screen, marginTop: 4, marginBottom: space[8], marginHorizontal: -layout.screen },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabOn: { backgroundColor: colors.navy },
  tabText: { fontFamily: font.bold, fontSize: 13, lineHeight: 16, letterSpacing: 0, color: '#194274' },
  tabOnText: { color: colors.white },
  list: { paddingHorizontal: layout.screen, paddingTop: 0, gap: space[16] },
  empty: { paddingTop: 48, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, lineHeight: 24, color: colors.text },
  emptyHint: { fontFamily: font.medium, fontSize: 13, lineHeight: 20, color: colors.gray, textAlign: 'center' },
  post: { paddingVertical: space[16], borderBottomWidth: 1, borderBottomColor: colors.line, position: 'relative' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userHit: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailUser: { marginBottom: space[8] },
  meatball: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meatballTxt: { fontFamily: font.bold, fontSize: 22, lineHeight: 24, color: colors.navy },
  menu: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 110,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    zIndex: 8,
    overflow: 'hidden',
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14 },
  menuTxt: { fontFamily: font.medium, fontSize: 14, color: colors.text },
  menuDanger: { fontFamily: font.medium, fontSize: 14, color: '#E35D5D' },
  avatar: { width: 35, height: 35, borderRadius: 18, borderWidth: 2, borderColor: colors.white },
  userName: { fontFamily: font.bold, fontSize: 14, lineHeight: 18, color: colors.text },
  level: { fontFamily: font.regular, fontSize: 10, lineHeight: 15, letterSpacing: 1, color: '#747779', marginTop: 4 },
  postTitle: { fontFamily: font.bold, fontSize: 20, lineHeight: 28, letterSpacing: -0.5, color: '#171717', marginTop: 18 },
  postBody: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 6 },
  time: { fontFamily: font.regular, fontSize: 11, lineHeight: 16, color: '#919191', textAlign: 'right', marginTop: 4 },
  photoWrap: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EEF3F8',
  },
  photo: { width: '100%' },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingRight: 8 },
  actionIcon: { width: 18, height: 18 },
  statText: { fontFamily: font.medium, fontSize: 12, color: '#262626' },
  statOn: { color: '#262626' },
  msg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  msgText: { fontFamily: font.medium, fontSize: 14, color: colors.muted, marginTop: 4 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...shadow.card,
  },
  chatTime: { fontFamily: font.regular, fontSize: 11, color: '#919191', alignSelf: 'flex-start', marginTop: 4 },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E9E63',
    borderWidth: 2,
    borderColor: colors.white,
  },
  chatFab: {
    position: 'absolute',
    right: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#C9E6F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...shadow.soft,
  },
  chatFabTxt: { fontFamily: font.bold, fontSize: 28, lineHeight: 32, color: colors.navy },
  picker: { ...StyleSheet.absoluteFill, backgroundColor: colors.white, zIndex: 30 },
  fab: {
    position: 'absolute',
    right: 22,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    zIndex: 20,
  },
  fabImg: { width: 64, height: 64 },
  detail: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.white,
    zIndex: 40,
    elevation: 24,
  },
  detailTop: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screen,
    marginBottom: space[8],
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontFamily: font.bold, fontSize: 28, lineHeight: 36, color: colors.navy },
  detailTitle: { fontFamily: font.bold, color: colors.navy, fontSize: 20, lineHeight: 28 },
  detailScroll: { paddingHorizontal: 22, paddingTop: space[16], paddingBottom: 32 },
  divider: { height: 1, backgroundColor: colors.line, marginTop: 24, marginBottom: 16 },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 16 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentName: { fontFamily: font.bold, fontSize: 13, lineHeight: 18, color: colors.text },
  commentText: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: colors.text, marginTop: 6 },
  commentMeta: { flexDirection: 'row', gap: 10, marginTop: 8 },
  timeInline: { fontFamily: font.regular, fontSize: 11, color: '#919191' },
  reply: { fontFamily: font.bold, fontSize: 11, color: '#919191' },
  commentLike: { alignItems: 'center', justifyContent: 'flex-start', gap: 2, minWidth: 40, minHeight: 44, paddingTop: 24 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 12,
    ...fieldFont,
    fontSize: 16,
    color: '#111111',
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : null),
  },
  send: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendTxt: { fontFamily: font.bold, color: colors.white, fontSize: 14 },
});
