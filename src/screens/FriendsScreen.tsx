import { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { asCharacterHead } from '../data/characters';
import * as api from '../api';
import { useApp } from '../store/AppProvider';
import { colors, fieldFont, font, layout, radius, space } from '../theme';

type Tab = 'friends' | 'add' | 'requests';

export function FriendsScreen() {
  const { go, previousTab, token } = useApp();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<api.FriendPreview[]>([]);
  const [incoming, setIncoming] = useState<api.FriendRequestRow[]>([]);
  const [outgoing, setOutgoing] = useState<api.FriendRequestRow[]>([]);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<api.FriendSearchHit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [list, reqs] = await Promise.all([api.listFriends(token), api.listFriendRequests(token)]);
      setFriends(list.friends);
      setIncoming(reqs.incoming);
      setOutgoing(reqs.outgoing);
    } catch (err) {
      setError(err instanceof Error ? err.message : '친구 정보를 불러오지 못했어요.');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const runSearch = async () => {
    if (!token) return;
    const q = query.trim();
    if (!q) {
      setHits(null);
      setError('닉네임이나 아이디를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await api.searchUsers(token, q);
      setHits(data.users);
    } catch (err) {
      setHits([]);
      setError(err instanceof Error ? err.message : '검색에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const requestUser = async (userId: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.sendFriendRequest(token, { userId });
      await load();
      if (query.trim()) {
        const data = await api.searchUsers(token, query.trim());
        setHits(data.users);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const accept = async (requestId: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.acceptFriendRequest(token, requestId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '수락에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  const decline = async (requestId: string) => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      await api.declineFriendRequest(token, requestId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '거절에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.top}>
          <Pressable style={styles.iconBtn} onPress={() => go('profile')}>
            <Image source={require('../../assets/ui/chevron.png')} style={styles.backIcon} />
          </Pressable>
          <AppText variant="heading" style={styles.heading}>
            친구 목록
          </AppText>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.tabs}>
          <TabPill label="내 친구" active={tab === 'friends'} onPress={() => setTab('friends')} />
          <TabPill label="친구 추가" active={tab === 'add'} onPress={() => setTab('add')} />
          <TabPill
            label={incoming.length ? `친구 요청 ${incoming.length}` : '친구 요청'}
            active={tab === 'requests'}
            onPress={() => setTab('requests')}
          />
        </View>

        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {tab === 'friends' ? (
            <>
              {friends.length === 0 ? (
                <AppText style={styles.empty}>아직 친구가 없어요. 친구 추가에서 찾아보세요.</AppText>
              ) : (
                friends.map((friend) => (
                  <View key={friend.id} style={styles.plainRow}>
                    <Image source={asCharacterHead(friend.characterId)} style={styles.avatar} />
                    <AppText style={styles.name}>{friend.nickname}</AppText>
                  </View>
                ))
              )}
              <AppText style={styles.count}>친구 {friends.length}명</AppText>
            </>
          ) : null}

          {tab === 'add' ? (
            <>
              <View style={styles.searchRow}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="닉네임 또는 아이디"
                  placeholderTextColor="#B0B4B8"
                  selectionColor={colors.navy}
                  underlineColorAndroid="transparent"
                  style={styles.search}
                  returnKeyType="search"
                  onSubmitEditing={runSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable style={styles.searchBtn} onPress={runSearch} disabled={busy}>
                  <AppText style={styles.searchBtnTxt}>{busy ? '검색중' : '검색'}</AppText>
                </Pressable>
              </View>
              {hits && hits.length === 0 ? <AppText style={styles.empty}>검색 결과가 없어요.</AppText> : null}
              {(hits ?? []).map((hit) => (
                <View key={hit.id} style={styles.result}>
                  <Image source={asCharacterHead(hit.characterId)} style={styles.avatar} />
                  <AppText style={styles.name}>{hit.nickname}</AppText>
                  <RelationButton hit={hit} busy={busy} onRequest={() => requestUser(hit.id)} onAccept={() => hit.requestId && accept(hit.requestId)} />
                </View>
              ))}
            </>
          ) : null}

          {tab === 'requests' ? (
            <>
              <AppText style={styles.section}>받은 요청</AppText>
              {incoming.length === 0 ? <AppText style={styles.empty}>받은 친구 요청이 없어요.</AppText> : null}
              {incoming.map((row) => (
                <View key={row.id} style={styles.result}>
                  <Image source={asCharacterHead(row.user.characterId)} style={styles.avatar} />
                  <AppText style={styles.name}>{row.user.nickname}</AppText>
                  <Pressable style={styles.accept} onPress={() => accept(row.id)} disabled={busy}>
                    <AppText style={styles.acceptTxt}>수락</AppText>
                  </Pressable>
                  <Pressable style={styles.decline} onPress={() => decline(row.id)} disabled={busy}>
                    <AppText style={styles.declineTxt}>거절</AppText>
                  </Pressable>
                </View>
              ))}
              <AppText style={[styles.section, { marginTop: space[24] }]}>보낸 요청</AppText>
              {outgoing.length === 0 ? <AppText style={styles.empty}>보낸 친구 요청이 없어요.</AppText> : null}
              {outgoing.map((row) => (
                <View key={row.id} style={styles.result}>
                  <Image source={asCharacterHead(row.user.characterId)} style={styles.avatar} />
                  <AppText style={styles.name}>{row.user.nickname}</AppText>
                  <Pressable style={styles.decline} onPress={() => decline(row.id)} disabled={busy}>
                    <AppText style={styles.declineTxt}>취소</AppText>
                  </Pressable>
                </View>
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
      <BottomNav active={previousTab === 'home' ? 'home' : previousTab} onChange={go} />
    </View>
  );
}

function TabPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabOn]}>
      <AppText style={[styles.tabTxt, active && styles.tabTxtOn]} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

function RelationButton({
  hit,
  busy,
  onRequest,
  onAccept,
}: {
  hit: api.FriendSearchHit;
  busy: boolean;
  onRequest: () => void;
  onAccept: () => void;
}) {
  if (hit.relation === 'friends') {
    return (
      <View style={styles.ghost}>
        <AppText style={styles.ghostTxt}>친구</AppText>
      </View>
    );
  }
  if (hit.relation === 'outgoing') {
    return (
      <View style={styles.ghost}>
        <AppText style={styles.ghostTxt}>요청됨</AppText>
      </View>
    );
  }
  if (hit.relation === 'incoming') {
    return (
      <Pressable style={styles.accept} onPress={onAccept} disabled={busy}>
        <AppText style={styles.acceptTxt}>수락</AppText>
      </Pressable>
    );
  }
  return (
    <Pressable style={styles.add} onPress={onRequest} disabled={busy}>
      <AppText style={styles.addTxt}>친구 추가</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: {
    flex: 1,
    paddingHorizontal: layout.header,
    paddingBottom: layout.navInset,
    paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 0,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 40 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 14, height: 12, transform: [{ rotate: '180deg' }] },
  heading: { color: colors.navy, fontFamily: font.bold },
  tabs: { flexDirection: 'row', gap: 8, marginTop: space[16], marginBottom: space[12] },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabOn: { backgroundColor: colors.navy },
  tabTxt: { fontFamily: font.bold, fontSize: 13, lineHeight: 18, color: colors.navy },
  tabTxtOn: { color: colors.white },
  error: { color: '#E35D5D', fontFamily: font.medium, fontSize: 13, marginBottom: space[8] },
  scroll: { paddingBottom: space[24], gap: 10 },
  empty: { textAlign: 'center', color: colors.gray, fontFamily: font.medium, marginTop: space[24] },
  count: { textAlign: 'center', color: colors.gray, fontFamily: font.medium, marginTop: space[16] },
  section: { fontFamily: font.bold, color: colors.navy, marginTop: space[8] },
  plainRow: { flexDirection: 'row', alignItems: 'center', gap: space[16], paddingVertical: space[10] },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    borderWidth: 1,
    borderColor: '#E6ECF2',
    borderRadius: radius.card,
    paddingHorizontal: space[12],
    paddingVertical: space[12],
    backgroundColor: colors.white,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { flex: 1, fontFamily: font.bold, fontSize: 16, color: colors.navy },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: space[8] },
  search: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8DEE6',
    paddingHorizontal: 14,
    ...fieldFont,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : null),
    // @ts-expect-error web
    outlineStyle: 'none',
  },
  searchBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnTxt: { color: colors.white, fontFamily: font.bold },
  add: { backgroundColor: colors.sky, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  addTxt: { color: colors.navy, fontFamily: font.bold, fontSize: 13 },
  accept: { backgroundColor: colors.navy, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  acceptTxt: { color: colors.white, fontFamily: font.bold, fontSize: 13 },
  decline: { backgroundColor: colors.sky, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  declineTxt: { color: colors.navy, fontFamily: font.bold, fontSize: 13 },
  ghost: { backgroundColor: '#EEF2F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  ghostTxt: { color: colors.gray, fontFamily: font.bold, fontSize: 13 },
});
