import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CHARACTERS } from '../data/characters';
import { AppText } from '../components/AppText';
import { CharacterCarousel } from '../components/CharacterCarousel';
import { PercentRing } from '../components/ProgressRing';
import { PrimaryButton } from '../components/PrimaryButton';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { useApp } from '../store/AppProvider';
import { colors, font, layout, space } from '../theme';

export function CharacterSelectScreen() {
  const { selectCharacter } = useApp();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const current = CHARACTERS[index];
  const done = progress >= 1;

  useEffect(() => {
    const start = Date.now();
    const duration = 2200;
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      // ease-out so the ring fills smoothly instead of stepping
      const eased = 1 - Math.pow(1 - t, 2.4);
      setProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <LinearGradient colors={['#C4DFFC', '#E5F1FD', '#FFFFFF']} locations={[0, 0.42, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.progressWrap}>
          <PercentRing progress={progress} />
          <AppText variant="body" style={styles.making}>
            {done ? '맞춤 루틴이 완성됐어요!' : '맞춤 루틴 만드는 중...'}
          </AppText>
        </View>

        <AppText style={styles.title}>
          함께 성장할 또 하나의{'\n'}나를 선택하세요.
        </AppText>
        <AppText variant="caption" style={styles.sub}>
          기본 체형으로 표시된 모습이에요
        </AppText>

        <View style={styles.stage}>
          <CharacterCarousel index={index} onIndexChange={setIndex} />
        </View>

        <View style={styles.cta}>
          <PrimaryButton label={`${current.name} 선택하기`} onPress={() => selectCharacter(current.id)} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: layout.screen,
    paddingTop: (Platform.OS === 'web' ? STATUS_BAR_HEIGHT : space[8]) + space[12],
  },
  progressWrap: { alignItems: 'center', marginTop: space[24] },
  making: { marginTop: space[12], color: colors.black, textAlign: 'center' },
  title: {
    marginTop: space[16],
    textAlign: 'center',
    fontFamily: font.extraBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.navy,
  },
  sub: { textAlign: 'center', color: colors.muted, marginTop: space[8], marginBottom: space[8] },
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  cta: { paddingTop: 28, paddingBottom: space[24] },
});
