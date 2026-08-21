import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
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
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { asCharacterHead } from '../data/characters';
import * as api from '../api';
import { useApp } from '../store/AppProvider';
import { colors, fieldFont, font, layout, space } from '../theme';

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function dateLabel(ts: number) {
  const d = new Date(ts);
  return `오늘 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function clock(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${pad(hour)}:${pad(d.getMinutes())} ${ampm}`;
}

export function ChatScreen() {
  const { go, previousTab, token, chatPeerId } = useApp();
  const [peer, setPeer] = useState<api.FriendPreview | null>(null);
  const [messages, setMessages] = useState<api.ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const back = previousTab === 'community' ? 'community' : previousTab === 'friends' ? 'friends' : 'community';

  useEffect(() => {
    if (!token || !chatPeerId) {
      go(back);
      return;
    }
    api
      .listChatMessages(token, chatPeerId)
      .then((data) => {
        setPeer(data.peer);
        setMessages(data.messages);
      })
      .catch(() => go(back));
  }, [token, chatPeerId]);

  useEffect(() => {
    const id = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [messages.length]);

  const firstStamp = messages[0]?.createdAt ?? Date.now();

  const send = async () => {
    const text = draft.trim();
    if (!token || !chatPeerId || !text || busy) return;
    setBusy(true);
    setDraft('');
    try {
      const { message } = await api.sendChatMessage(token, chatPeerId, text);
      setMessages((prev) => [...prev, message]);
    } catch {
      setDraft(text);
    } finally {
      setBusy(false);
    }
  };

  const grouped = useMemo(() => messages, [messages]);

  if (!peer) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.top}>
          <Pressable style={styles.iconBtn} onPress={() => go(back)}>
            <Image source={require('../../assets/ui/icon-chat-back.png')} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
          <View style={styles.peer}>
            <View>
              <Image source={asCharacterHead(peer.characterId)} style={styles.head} />
              <View style={styles.online} />
            </View>
            <View style={styles.peerText}>
              <AppText style={styles.name}>{peer.nickname}</AppText>
              <AppText style={styles.status}>현재 활동 중</AppText>
            </View>
          </View>
          <View style={styles.calls}>
            <Image source={require('../../assets/ui/icon-video-call.png')} style={styles.callIcon} resizeMode="contain" />
            <Image source={require('../../assets/ui/icon-phone-call.png')} style={styles.callIcon} resizeMode="contain" />
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scroll} contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false}>
            <View style={styles.datePill}>
              <AppText style={styles.dateTxt}>{dateLabel(firstStamp)}</AppText>
            </View>
            {grouped.map((item) => (
              <View key={item.id} style={[styles.row, item.mine ? styles.rowMine : styles.rowTheirs]}>
                {!item.mine ? <Image source={asCharacterHead(peer.characterId)} style={styles.bubbleHead} /> : null}
                <View style={[styles.col, item.mine && styles.colMine]}>
                  <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}>
                    <AppText style={[styles.body, item.mine && styles.bodyMine]}>{item.text}</AppText>
                  </View>
                  <View style={[styles.metaRow, item.mine && styles.metaRowMine]}>
                    <AppText style={[styles.meta, item.mine && styles.metaMine]}>{clock(item.createdAt)}</AppText>
                    {item.mine ? <AppText style={styles.check}>✓</AppText> : null}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.composer}>
            <Image source={require('../../assets/ui/icon-chat-plus.png')} style={styles.toolIcon} resizeMode="contain" />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="보낼 내용 입력"
              placeholderTextColor="#8A939C"
              selectionColor={colors.navy}
              underlineColorAndroid="transparent"
              style={styles.input}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <Image source={require('../../assets/ui/icon-chat-gallery.png')} style={styles.galleryIcon} resizeMode="contain" />
            <Pressable onPress={send} disabled={busy} hitSlop={6}>
              <Image source={require('../../assets/ui/icon-chat-send.png')} style={styles.sendIcon} resizeMode="contain" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F8FC' },
  top: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 8,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 16, height: 16 },
  peer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  peerText: { justifyContent: 'center' },
  head: { width: 40, height: 40, borderRadius: 20 },
  online: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E9E63',
    borderWidth: 2,
    borderColor: colors.white,
  },
  name: { fontFamily: font.bold, fontSize: 20, lineHeight: 24, color: colors.navy },
  status: { fontFamily: font.medium, fontSize: 12, lineHeight: 14, color: '#2E9E63', marginTop: 0 },
  calls: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 8 },
  callIcon: { width: 32, height: 32 },
  thread: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 12 },
  datePill: {
    alignSelf: 'center',
    backgroundColor: colors.navy,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  dateTxt: { color: colors.white, fontFamily: font.bold, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '100%' },
  rowTheirs: { alignSelf: 'flex-start' },
  rowMine: { alignSelf: 'flex-end' },
  bubbleHead: { width: 28, height: 28, borderRadius: 14 },
  col: { maxWidth: 20 * 14 + 28 },
  colMine: { alignItems: 'flex-end', maxWidth: 20 * 14 + 28 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start' },
  theirs: { backgroundColor: colors.white },
  mine: { backgroundColor: '#D7ECFA', alignSelf: 'flex-end' },
  body: { fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: colors.text },
  bodyMine: { color: colors.navy },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaRowMine: { justifyContent: 'flex-end' },
  meta: { fontFamily: font.regular, fontSize: 11, color: '#6B7280' },
  metaMine: { color: '#2E9E63' },
  check: { fontFamily: font.bold, fontSize: 11, lineHeight: 14, color: '#2E9E63' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  toolIcon: { width: 40, height: 40 },
  galleryIcon: { width: 28, height: 28 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
    ...fieldFont,
    fontSize: 16,
    color: '#111111',
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : null),
  },
  sendIcon: { width: 44, height: 44 },
});
