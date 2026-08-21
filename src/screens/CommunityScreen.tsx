import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
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
import { CHARACTERS, Character, asCharacterHead, getCharacter } from '../data/characters';
import { useApp } from '../store/AppProvider';
import * as api from '../api';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
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

const POSTS: Post[] = [
  {
    id: 'gym',
    user: CHARACTERS.find((c) => c.id === 'sloth')!,
    nickname: '늘보씨',
    level: 27,
    title: '오랜만에 헬스장 인증!',
    body: '퇴근하고 헬스장 오기까지가 제일 힘들었지만, 막상 오니까 개운하네요. 오늘로 7일 연속 퀘스트성공! 🔥💪',
    time: '1시간 전',
    likes: 342,
    comments: 45,
    photos: [],
    photo: require('../../assets/community/post1.png'),
    tab: 'workout',
  },
  {
    id: 'gorilla',
    user: CHARACTERS.find((c) => c.id === 'gorilla')!,
    nickname: '고릴',
    level: 48,
    title: '말보다 결과로 증명한다',
    body: '오늘의 퀘스트 클리어 ✅\n레벨업 완료 🔥\n오늘도 성장 +1',
    time: '2시간 전',
    likes: 512,
    comments: 113,
    photos: [],
    photo: require('../../assets/community/post2.png'),
    tab: 'workout',
  },
  {
    id: 'legs',
    user: CHARACTERS.find((c) => c.id === 'rabbit')!,
    nickname: '토리',
    level: 32,
    title: '하체 끝난 날 인증',
    body: '스쿼트 30회 클리어. 내일은 유산소 같이 할 사람?',
    time: '4시간 전',
    likes: 1276,
    comments: 324,
    photos: [],
    photo: require('../../assets/community/post3.png'),
    tab: 'workout',
  },
  {
    id: 'poke',
    user: CHARACTERS.find((c) => c.id === 'rabbit')!,
    nickname: '토리',
    level: 6,
    title: '오늘의 식단 공유 💕',
    body: '연어 포케볼로 가볍게. 단백질이랑 채소 같이 챙겼어요.',
    time: '1시간 전',
    likes: 133,
    comments: 22,
    photos: [],
    photo: require('../../assets/community/diet-poke.png'),
    tab: 'diet',
  },
  {
    id: 'meal',
    user: CHARACTERS.find((c) => c.id === 'bear')!,
    nickname: '곰이',
    level: 32,
    title: '일주일 도시락 완성',
    body: '미리 나눠두면 저녁에 덜 흔들려요. 오늘도 식단 클리어!',
    time: '3시간 전',
    likes: 88,
    comments: 12,
    photos: [],
    photo: require('../../assets/community/diet-meal.png'),
    tab: 'diet',
  },
];

const COMMENTS: Record<string, CommentItem[]> = {
  gym: [
    {
      id: 'c1',
      user: CHARACTERS.find((c) => c.id === 'rabbit')!,
      level: 6,
      text: '와우! 7일 연속 대단해요... 저도 자극받고 갑니다!',
      time: '1시간 전',
      likes: 12,
    },
    {
      id: 'c2',
      user: CHARACTERS.find((c) => c.id === 'bear')!,
      level: 32,
      text: '헬스장 조명 미쳤다 ㅋㅋ 오늘 하체 루틴 공유 부탁!',
      time: '58분 전',
      likes: 8,
    },
    {
      id: 'c3',
      user: CHARACTERS.find((c) => c.id === 'hamster')!,
      level: 21,
      text: '연속 퀘스트 진짜 존경합니다 🔥',
      time: '40분 전',
      likes: 5,
    },
  ],
};

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
    photos: post.photos,
    photo: post.photos[0] ? { uri: post.photos[0] } : undefined,
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

function HeartIcon({ on, size = 18 }: { on: boolean; size?: number }) {
  return (
    <Image
      source={on ? require('../../assets/community/heart-on.png') : require('../../assets/community/heart-off.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
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
      <Pressable style={styles.stat} onPress={onLike} hitSlop={8}>
        <HeartIcon on={liked} />
        <AppText style={[styles.statText, liked && styles.statOn]}>{likes}</AppText>
      </Pressable>
      <Pressable style={styles.stat} onPress={onComment}>
        <Image source={require('../../assets/community/comment.png')} style={styles.actionIcon} resizeMode="contain" />
        <AppText style={styles.statText}>{comments}</AppText>
      </Pressable>
      <Pressable style={styles.shareBtn}>
        <Image source={require('../../assets/community/share.png')} style={styles.shareIcon} resizeMode="contain" />
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
          <Pressable style={styles.meatball} onPress={onMenu} hitSlop={8}>
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
        {post.photo ? (
          <View style={styles.photoWrap}>
            <Image source={post.photo} style={styles.photo} resizeMode="cover" />
          </View>
        ) : null}
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
  const remote = !!post.authorId;
  const seed = useMemo(() => COMMENTS[post.id] ?? [], [post.id]);
  const [list, setList] = useState<CommentItem[]>(seed);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token || !remote) {
      setList(COMMENTS[post.id] ?? []);
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
        if (live) setList(COMMENTS[post.id] ?? []);
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
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.detailTop}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <AppText style={styles.backTxt}>‹</AppText>
          </Pressable>
          <AppText variant="title" style={styles.detailTitle}>
            {post.tab === 'diet' ? '식단 공유' : '운동 인증'}
          </AppText>
          <View style={styles.backBtn} />
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
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
            {post.photo ? (
              <View style={styles.photoWrap}>
                <Image source={post.photo} style={styles.photo} resizeMode="cover" />
              </View>
            ) : null}
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
                      <AppText style={styles.reply}>답글</AppText>
                    </View>
                  </View>
                  <Pressable style={styles.commentLike} onPress={() => toggleCommentHeart(item)}>
                    <HeartIcon on={!!item.liked} size={14} />
                    <AppText style={[styles.statText, item.liked && styles.statOn]}>{item.likes}</AppText>
                  </Pressable>
                </View>
              ))}
          </ScrollView>
          <View style={styles.composer}>
            <Image source={me.head} style={styles.commentAvatar} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#B0B4B8"
              selectionColor={colors.navy}
              underlineColorAndroid="transparent"
              style={styles.input}
            />
            <Pressable style={styles.send} onPress={submitComment} disabled={busy}>
              <AppText style={styles.sendTxt}>등록</AppText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function CommunityScreen() {
  const { go, openChat, nickname, coins, characterId, level, addCoins, token, userId } = useApp();
  const [tab, setTab] = useState<Tab>('workout');
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
  const me = { ...getCharacter(characterId), nickname };
  const allPosts = [...userPosts, ...POSTS];
  const feed = allPosts.filter((p) => p.tab === tab);
  const openPost = allPosts.find((p) => p.id === openId) ?? null;

  useEffect(() => {
    let live = true;
    api
      .listPosts(undefined, token ?? undefined)
      .then(({ posts }) => {
        if (!live) return;
        const mapped = posts.map(fromRemote);
        setUserPosts(mapped);
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
        <ScreenHeader nickname={nickname} coins={coins} characterId={characterId} onPressProfile={() => go('profile')} />

        <View style={styles.tabs}>
          {(
            [
              { id: 'workout', label: '운동 인증' },
              { id: 'diet', label: '식단 공유' },
              { id: 'message', label: '메세지' },
            ] as const
          ).map((item) => (
            <Pressable key={item.id} onPress={() => setTab(item.id)} style={[styles.tab, tab === item.id && styles.tabOn]}>
              <AppText style={[styles.tabText, tab === item.id && styles.tabOnText]}>{item.label}</AppText>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {tab === 'message'
            ? chats.length === 0
              ? (
                <View style={styles.empty}>
                  <AppText style={styles.emptyTitle}>아직 채팅이 없어요</AppText>
                  <AppText style={styles.emptyHint}>친구를 추가한 뒤 오른쪽 아래 버튼으로 대화를 시작해 보세요!</AppText>
                </View>
              )
              : chats.map((row) => (
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
                  <AppText style={styles.emptyTitle}>{tab === 'diet' ? '아직 식단 공유가 없어요' : '아직 운동 인증이 없어요'}</AppText>
                  <AppText style={styles.emptyHint}>오른쪽 아래 연필 버튼으로 게시물을 올려 보세요!</AppText>
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
        <Pressable style={styles.chatFab} onPress={() => setPickFriend(true)}>
          <AppText style={styles.chatFabTxt}>+</AppText>
        </Pressable>
      ) : null}
      {tab !== 'message' && !openPost && !compose ? (
        <Pressable
          style={styles.fab}
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
            if (!token) return;
            try {
              if (editing) {
                const { post } = await api.updatePost(token, editing.id, { title, body, photos, visibility });
                const mapped = fromRemote(post);
                setUserPosts((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
              } else {
                const { post } = await api.createPost(token, {
                  title,
                  body,
                  photos,
                  tab: composeKind,
                  visibility,
                });
                setUserPosts((prev) => [fromRemote(post), ...prev.filter((item) => item.id !== post.id)]);
                addCoins(100);
              }
              closeCompose();
              setTab(composeKind);
            } catch {
              undefined;
            }
          }}
        />
      ) : null}
      {pickFriend ? (
        <View style={styles.picker}>
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <View style={styles.detailTop}>
              <Pressable style={styles.backBtn} onPress={() => setPickFriend(false)}>
                <AppText style={styles.backTxt}>‹</AppText>
              </Pressable>
              <AppText style={styles.detailTitle}>친구와 채팅</AppText>
              <View style={styles.backBtn} />
            </View>
            <ScrollView contentContainerStyle={styles.list}>
              {chats.length === 0 ? (
                <View style={styles.empty}>
                  <AppText style={styles.emptyTitle}>채팅할 친구가 없어요</AppText>
                  <Pressable onPress={() => { setPickFriend(false); go('friends'); }}>
                    <AppText style={styles.emptyHint}>친구 추가하러 가기</AppText>
                  </Pressable>
                </View>
              ) : (
                chats.map((row) => (
                  <Pressable
                    key={row.peer.id}
                    style={styles.chatCard}
                    onPress={() => {
                      setPickFriend(false);
                      openChat(row.peer.id);
                    }}
                  >
                    <Image source={asCharacterHead(row.peer.characterId)} style={styles.avatar} />
                    <AppText style={styles.userName}>{row.peer.nickname}</AppText>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      ) : null}
      <BottomNav active="community" onChange={go} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 10, paddingHorizontal: 31, marginTop: space[8], marginBottom: space[8] },
  tab: {
    width: 106,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabOn: { backgroundColor: colors.navy },
  tabText: { fontFamily: font.bold, fontSize: 13, lineHeight: 16, letterSpacing: 1.2, color: '#194274' },
  tabOnText: { color: colors.white },
  list: { paddingHorizontal: 22, paddingTop: space[20], paddingBottom: layout.navInset, gap: space[16] },
  empty: { paddingTop: 48, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, lineHeight: 24, color: colors.text },
  emptyHint: { fontFamily: font.medium, fontSize: 13, lineHeight: 20, color: colors.gray, textAlign: 'center' },
  post: { paddingVertical: space[16], borderBottomWidth: 1, borderBottomColor: colors.line, position: 'relative' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userHit: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailUser: { marginBottom: space[8] },
  meatball: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    backgroundColor: colors.skyCard,
  },
  photo: { width: '100%', height: 210 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { width: 18, height: 18 },
  shareBtn: { marginLeft: 'auto' },
  shareIcon: { width: 18, height: 18 },
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
    bottom: layout.navHeight + 12,
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
    bottom: layout.navHeight + 12,
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
    zIndex: 28,
  },
  detailTop: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screen,
    marginTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 0,
    marginBottom: space[8],
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontFamily: font.bold, fontSize: 28, lineHeight: 36, color: colors.navy },
  detailTitle: { fontFamily: font.bold, color: colors.navy, fontSize: 20, lineHeight: 28 },
  detailScroll: { paddingHorizontal: 22, paddingTop: space[16], paddingBottom: 32 },
  divider: { height: 1, backgroundColor: colors.line, marginTop: 24, marginBottom: 16 },
  comment: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentName: { fontFamily: font.bold, fontSize: 13, lineHeight: 18, color: colors.text },
  commentText: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: colors.text, marginTop: 6 },
  commentMeta: { flexDirection: 'row', gap: 10, marginTop: 8 },
  timeInline: { fontFamily: font.regular, fontSize: 11, color: '#919191' },
  reply: { fontFamily: font.bold, fontSize: 11, color: '#919191' },
  commentLike: { alignItems: 'center', gap: 2, minWidth: 28 },
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
