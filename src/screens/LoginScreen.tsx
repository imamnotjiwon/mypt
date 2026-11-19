import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
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
import { CHARACTERS, Character, CharacterId } from '../data/characters';
import { useAppInsets } from '../hooks/useAppInsets';
import { useFrameWidth } from '../hooks/useDesignScale';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { colors, font, layout, space } from '../theme';
import { useApp } from '../store/AppProvider';

const TILE_GAP = 12;
const MARQUEE_PAD = 24;
const MARQUEE_GAP = 17;
const TILE_RATIO = 210 / 169;

/** 로그인 마퀴 타일 안 캐릭터만 — 타일 박스는 그대로 */
const LOGIN_FIT: Partial<Record<CharacterId, number>> = {
  otter: 0.86,
  dog: 0.86,
  cat: 0.84,
  hamster: 0.62,
};

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
  tileW,
  tileH,
}: {
  characters: Character[];
  direction: 'up' | 'down';
  tileW: number;
  tileH: number;
}) {
  const itemH = tileH + TILE_GAP;
  const distance = Math.max(1, characters.length) * itemH;
  const loop = [...characters, ...characters];
  const translateY = useRef(new Animated.Value(direction === 'up' ? 0 : -distance)).current;

  useEffect(() => {
    let pos = direction === 'up' ? 0 : -distance;
    let raf = 0;
    let last = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const speed = 24;
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
          <View
            key={`${character.id}-${index}`}
            style={[styles.tile, { width: tileW, height: tileH }, index % 2 ? styles.tileAlt : null]}
          >
            {(() => {
              const fit = LOGIN_FIT[character.id] ?? 1;
              const imgW = tileW * fit;
              const imgH = tileH * 0.94 * fit;
              const nudge = Math.round(imgW * (character.nudgeX ?? 0));
              return (
                <Image
                  source={character.body}
                  style={{
                    width: imgW,
                    height: imgH,
                    transform: [{ translateX: nudge }],
                  }}
                  resizeMode="contain"
                />
              );
            })()}
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
  const keyboard = useKeyboardInset();
  const keyboardOpen = keyboard > 0;
  const { bottom } = useAppInsets();
  const frameW = useFrameWidth();
  const tileW = Math.max(120, (frameW - MARQUEE_PAD * 2 - MARQUEE_GAP) / 2);
  const tileH = tileW * TILE_RATIO;
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
    <View style={styles.root}>
      <View style={styles.collage}>
        <View style={styles.marquee}>
          <MarqueeColumn characters={columns.left} direction="up" tileW={tileW} tileH={tileH} />
          <MarqueeColumn characters={columns.right} direction="down" tileW={tileW} tileH={tileH} />
        </View>

        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.08)',
            'rgba(255,255,255,0.28)',
            'rgba(255,255,255,0.55)',
            'rgba(255,255,255,0.82)',
            'rgba(255,255,255,0.96)',
            colors.white,
          ]}
          locations={[0, 0.18, 0.36, 0.52, 0.68, 0.84, 1]}
          style={styles.fadeBottom}
          pointerEvents="none"
        />

        {keyboardOpen ? null : (
          <View style={styles.brand} pointerEvents="none">
            <LogoMark width={248} height={96} />
            <AppText variant="caption" style={styles.slogan}>
              AI가 만드는 맞춤 루틴
            </AppText>
          </View>
        )}
      </View>

      <SafeAreaView
        edges={[]}
        style={[
          styles.sheet,
          {
            paddingBottom: keyboardOpen ? Math.max(12, keyboard) : bottom,
          },
        ]}
      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  collage: { flex: 1, overflow: 'hidden' },
  marquee: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: MARQUEE_PAD,
    gap: MARQUEE_GAP,
    overflow: 'hidden',
  },
  column: {
    flex: 1,
    overflow: 'hidden',
  },
  tile: {
    borderRadius: 28,
    backgroundColor: colors.sky,
    marginBottom: TILE_GAP,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileAlt: {
    backgroundColor: '#DCEEF9',
  },
  fadeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 360 },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 132,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    backgroundColor: 'transparent',
  },
  slogan: { color: colors.muted, fontFamily: font.medium, fontSize: 14 },
  sheet: { flexGrow: 0, flexShrink: 0, backgroundColor: colors.white, marginTop: -1 },
  actions: {
    paddingHorizontal: layout.loginActions,
    paddingBottom: space[8],
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
