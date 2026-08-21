import { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { STATUS_BAR_HEIGHT } from './PhoneStatusBar';
import { Character } from '../data/characters';
import { colors, fieldFont, font, layout, space } from '../theme';

const CAM_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none"><path d="M7.2 0L5.85 1.6H2.2C1 1.6 0 2.6 0 3.8V16.2C0 17.4 1 18.4 2.2 18.4H19.8C21 18.4 22 17.4 22 16.2V3.8C22 2.6 21 1.6 19.8 1.6H16.15L14.8 0H7.2ZM11 15.2C8.24 15.2 6 12.96 6 10.2C6 7.44 8.24 5.2 11 5.2C13.76 5.2 16 7.44 16 10.2C16 12.96 13.76 15.2 11 15.2Z" fill="#9AA3AD"/><circle cx="11" cy="10.2" r="3.2" fill="#9AA3AD"/></svg>`,
);

type Visibility = 'public' | 'friends';

export type ComposeResult = {
  title: string;
  body: string;
  photos: string[];
  visibility: Visibility;
};

type Props = {
  kind: 'workout' | 'diet';
  me: Character;
  level: number;
  initial?: { title: string; body: string; photos: string[] };
  onClose: () => void;
  onPublish: (result: ComposeResult) => void;
};

function pickImage(onPicked: (uri: string) => void) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onPicked(reader.result);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

export function CommunityCompose({ kind, me, level, initial, onClose, onPublish }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [photos, setPhotos] = useState<(string | null)[]>(() => {
    const next: (string | null)[] = [null, null, null, null, null];
    (initial?.photos ?? []).slice(0, 5).forEach((uri, i) => {
      next[i] = uri;
    });
    return next;
  });
  const [visibility, setVisibility] = useState<Visibility>('friends');
  const canPost = title.trim().length > 0 || body.trim().length > 0;
  const heading = kind === 'diet' ? '식단 공유' : '운동 인증';

  const addPhoto = (index: number) => {
    pickImage((uri) => {
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = uri;
        return next;
      });
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.top}>
          <Pressable style={styles.backBtn} onPress={onClose}>
            <AppText style={styles.backTxt}>‹</AppText>
          </Pressable>
          <AppText variant="heading" style={styles.topTitle}>
            게시물 {initial ? '수정' : '작성'}
          </AppText>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.userRow}>
            <Image source={me.head} style={styles.avatar} resizeMode="contain" />
            <View>
              <AppText style={styles.name}>{me.nickname}</AppText>
              <AppText style={styles.level}>LV.{level}</AppText>
            </View>
            <View style={styles.kindPill}>
              <AppText style={styles.kindTxt}>{heading}</AppText>
            </View>
          </View>

          <AppText style={styles.section}>게시물 내용 작성</AppText>
          <AppText style={styles.hint}>공유하고 싶은 내용을 작성해 주세요!</AppText>

          <View style={styles.titleBox}>
            <TextInput
              value={title}
              onChangeText={(text) => setTitle(text.slice(0, 30))}
              placeholder="제목을 입력하세요 (최대 30자)"
              placeholderTextColor="#B0B4B8"
              selectionColor={colors.navy}
              underlineColorAndroid="transparent"
              style={styles.titleInput}
            />
            <AppText style={styles.counter}>{title.length}/30</AppText>
          </View>

          <View style={styles.bodyBox}>
            <TextInput
              value={body}
              onChangeText={(text) => setBody(text.slice(0, 1000))}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#B0B4B8"
              selectionColor={colors.navy}
              underlineColorAndroid="transparent"
              style={styles.bodyInput}
              multiline
              textAlignVertical="top"
            />
            <AppText style={styles.bodyCounter}>{body.length}/1000</AppText>
          </View>

          <AppText style={[styles.section, { marginTop: space[24] }]}>사진 추가 (선택)</AppText>
          <AppText style={styles.hint}>운동 사진, 식단, 풍경 등 자유롭게 올려 주세요!</AppText>
          <View style={styles.photoRow}>
            {photos.map((uri, i) => (
              <Pressable key={i} style={styles.photoSlot} onPress={() => addPhoto(i)}>
                {uri ? (
                  <Image source={{ uri }} style={styles.photo} />
                ) : i === 0 ? (
                  <View style={styles.photoEmpty}>
                    <Image source={{ uri: `data:image/svg+xml;utf8,${CAM_SVG}` }} style={styles.cam} />
                    <AppText style={styles.photoAdd}>사진 추가</AppText>
                  </View>
                ) : (
                  <AppText style={styles.plus}>+</AppText>
                )}
              </Pressable>
            ))}
          </View>

          <AppText style={[styles.section, styles.visHead]}>공개 설정</AppText>
          <View style={styles.visRow}>
            <Pressable
              style={[styles.visBtn, visibility === 'public' && styles.visOn]}
              onPress={() => setVisibility('public')}
            >
              <Image
                source={
                  visibility === 'public'
                    ? require('../../assets/ui/icon-lock-open-on.png')
                    : require('../../assets/ui/icon-lock-open-off.png')
                }
                style={styles.lock}
                resizeMode="contain"
              />
              <View style={styles.visCopy}>
                <AppText style={[styles.visTitle, visibility === 'public' && styles.visOnTxt]}>전체공개</AppText>
                <AppText style={[styles.visSub, visibility === 'public' && styles.visOnSub]}>모든 사용자가 볼 수 있어요!</AppText>
              </View>
            </Pressable>
            <Pressable
              style={[styles.visBtn, visibility === 'friends' && styles.visOn]}
              onPress={() => setVisibility('friends')}
            >
              <Image
                source={
                  visibility === 'friends'
                    ? require('../../assets/ui/icon-lock-closed-on.png')
                    : require('../../assets/ui/icon-lock-closed-off.png')
                }
                style={styles.lock}
                resizeMode="contain"
              />
              <View style={styles.visCopy}>
                <AppText style={[styles.visTitle, visibility === 'friends' && styles.visOnTxt]}>비공개</AppText>
                <AppText style={[styles.visSub, visibility === 'friends' && styles.visOnSub]}>친구들만 볼 수 있어요!</AppText>
              </View>
            </Pressable>
          </View>

          <View style={{ marginTop: space[24] }}>
            <PrimaryButton
              label={initial ? '수정하기' : '올리기'}
              disabled={!canPost}
              onPress={() =>
                onPublish({
                  title: title.trim() || heading,
                  body: body.trim(),
                  photos: photos.filter((item): item is string => !!item),
                  visibility,
                })
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: layout.navHeight,
    backgroundColor: colors.white,
    zIndex: 32,
  },
  safe: { flex: 1, paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 0 },
  top: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screen,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontFamily: font.bold, fontSize: 28, lineHeight: 36, color: colors.navy },
  topTitle: { fontFamily: font.bold, color: colors.black },
  scroll: { paddingHorizontal: layout.screen, paddingBottom: layout.navInset + 24 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: space[8], marginBottom: space[20] },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: { fontFamily: font.bold, fontSize: 16, lineHeight: 22, color: colors.black },
  level: { fontFamily: font.regular, fontSize: 12, lineHeight: 16, color: '#747779' },
  kindPill: {
    marginLeft: 'auto',
    backgroundColor: colors.sky,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kindTxt: { fontFamily: font.bold, fontSize: 12, color: colors.navy },
  section: { fontFamily: font.bold, fontSize: 16, lineHeight: 24, color: colors.black },
  hint: { fontFamily: font.medium, fontSize: 13, lineHeight: 20, color: colors.gray, marginBottom: space[12] },
  titleBox: {
    borderWidth: 1,
    borderColor: '#D8DEE6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space[10],
  },
  titleInput: {
    flex: 1,
    ...fieldFont,
    fontSize: 14,
    color: colors.text,
    height: 48,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  counter: { fontFamily: font.medium, fontSize: 12, color: colors.gray },
  bodyBox: {
    borderWidth: 1,
    borderColor: '#D8DEE6',
    borderRadius: 14,
    padding: 14,
    minHeight: 140,
  },
  bodyInput: {
    ...fieldFont,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  bodyCounter: { alignSelf: 'flex-end', fontFamily: font.medium, fontSize: 12, color: colors.gray, marginTop: 8 },
  photoRow: { flexDirection: 'row', gap: 8 },
  photoSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8DEE6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  photo: { width: '100%', height: '100%' },
  photoEmpty: { alignItems: 'center', gap: 2 },
  cam: { width: 20, height: 16, marginBottom: 2 },
  photoAdd: { fontFamily: font.medium, fontSize: 9, color: colors.gray, textAlign: 'center' },
  plus: { fontFamily: font.medium, fontSize: 22, color: '#C5CDD6' },
  visHead: { marginTop: space[24] + 20 + space[12], marginBottom: space[12] },
  lock: { width: 22, height: 24 },
  visRow: { flexDirection: 'row', gap: 10 },
  visBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8DEE6',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  visCopy: { flex: 1 },
  visOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  visTitle: { fontFamily: font.bold, fontSize: 14, color: colors.black },
  visSub: { fontFamily: font.medium, fontSize: 11, lineHeight: 16, color: colors.gray, marginTop: 2 },
  visOnTxt: { color: colors.white },
  visOnSub: { color: 'rgba(255,255,255,0.8)' },
});
