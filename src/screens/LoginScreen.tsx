import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { AuthInput } from '../components/AuthInput';
import { LogoMark } from '../components/Marks';
import { PrimaryButton } from '../components/PrimaryButton';
import { CHARACTERS, Character } from '../data/characters';
import { colors, font, layout, space } from '../theme';
import { useApp } from '../store/AppProvider';

const TILE_W = 169;
const TILE_H = 210;
const TILE_GAP = 12;
const ITEM_H = TILE_H + TILE_GAP;

function shuffle<T>(list: T[]) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function MarqueeColumn({
  characters,
  direction,
}: {
  characters: Character[];
  direction: 'up' | 'down';
}) {
  const distance = Math.max(1, characters.length) * ITEM_H;
  const loop = [...characters, ...characters];
  const translateY = useRef(new Animated.Value(direction === 'up' ? 0 : -distance)).current;

  useEffect(() => {
    let pos = direction === 'up' ? 0 : -distance;
    let raf = 0;
    let last = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const speed = direction === 'up' ? 26 : 22;
    translateY.setValue(pos);

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      pos += direction === 'up' ? -speed * (dt / 1000) : speed * (dt / 1000);
      if (pos <= -distance) pos += distance;
      if (pos >= 0) pos -= distance;
      translateY.setValue(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction, distance, translateY]);

  return (
    <View style={styles.column}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {loop.map((character, index) => (
          <View key={`${character.id}-${index}`} style={[styles.tile, index % 2 ? styles.tileAlt : null]}>
            <Image source={character.body} style={styles.tileImg} resizeMode="contain" />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function LoginScreen() {
  const { login, go, pendingUsername } = useApp();
  const [username, setUsername] = useState(pendingUsername);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const columns = useMemo(() => {
    const unique = shuffle(CHARACTERS);
    return {
      left: unique.slice(0, 4),
      right: unique.slice(4),
    };
  }, []);

  useEffect(() => {
    if (pendingUsername) setUsername(pendingUsername);
  }, [pendingUsername]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      setKeyboardOpen(true);
    });
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKeyboardOpen(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const submit = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <View style={[styles.collage, keyboardOpen && styles.collageCompact]}>
        <View style={styles.marquee}>
          <MarqueeColumn characters={columns.left} direction="up" />
          <MarqueeColumn characters={columns.right} direction="down" />
        </View>

        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', colors.white, colors.white]}
          locations={[0, 0.34, 0.55, 1]}
          style={styles.fadeBottom}
        />
        <View style={styles.fadeCap} />

        {keyboardOpen ? null : (
          <View style={styles.brand}>
            <LogoMark width={186} height={46} />
            <AppText variant="caption" style={styles.slogan}>
              AI가 만드는 맞춤 루틴
            </AppText>
          </View>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.actions}
          bounces={false}
        >
          <AuthInput
            value={username}
            onChangeText={setUsername}
            placeholder="아이디를 입력하세요"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
          />
          <AuthInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요"
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <PrimaryButton label={busy ? '로그인 중...' : '로그인하기'} onPress={submit} disabled={busy} />
          <View style={styles.footerRow}>
            <Pressable onPress={() => go('signup')} hitSlop={8}>
              <AppText style={styles.footerLink}>회원가입</AppText>
            </Pressable>
            <AppText style={styles.footerDot}>/</AppText>
            <Pressable onPress={() => go('findPassword')} hitSlop={8}>
              <AppText style={styles.footerLink}>비밀번호 찾기</AppText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  collage: { flex: 1, overflow: 'hidden' },
  collageCompact: { flexGrow: 0, flexShrink: 1, height: 160 },
  marquee: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 17,
    overflow: 'hidden',
  },
  column: {
    flex: 1,
    overflow: 'hidden',
  },
  tile: {
    width: TILE_W,
    height: TILE_H,
    borderRadius: 28,
    backgroundColor: colors.sky,
    marginBottom: TILE_GAP,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tileAlt: {
    backgroundColor: '#DCEEF9',
  },
  tileImg: {
    width: 168,
    height: 198,
  },
  fadeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 250 },
  fadeCap: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, backgroundColor: colors.white },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 86,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    backgroundColor: colors.white,
  },
  slogan: { color: colors.muted, fontFamily: font.medium, fontSize: 14 },
  sheet: { flexGrow: 0, flexShrink: 0, backgroundColor: colors.white, marginTop: -1 },
  actions: {
    paddingHorizontal: layout.loginActions,
    paddingBottom: space[16],
    paddingTop: space[8],
    gap: space[12],
  },
  error: { fontFamily: font.medium, fontSize: 13, color: '#E35D5D' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 4,
    paddingBottom: space[8],
  },
  footerLink: { fontFamily: font.medium, fontSize: 13, color: colors.gray },
  footerDot: { fontFamily: font.medium, fontSize: 13, color: colors.gray },
});
