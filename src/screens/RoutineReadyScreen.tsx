import { Image, ImageSourcePropType, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { CharacterId, getCharacter } from '../data/characters';
import { useAppInsets } from '../hooks/useAppInsets';
import { colors, font, layout, space } from '../theme';
import { useApp } from '../store/AppProvider';

/** 피그마 Group 내보내기 — 카드+말풍선+캐릭터 배치가 이미 맞춰진 씬 */
const READY_SCENES: Record<CharacterId, ImageSourcePropType> = {
  otter: require('../../assets/characters/ready-scene-otter.png'),
  cat: require('../../assets/characters/ready-scene-cat.png'),
  rabbit: require('../../assets/characters/ready-scene-rabbit.png'),
  dog: require('../../assets/characters/ready-scene-dog.png'),
  gorilla: require('../../assets/characters/ready-scene-gorilla.png'),
  hamster: require('../../assets/characters/ready-scene-hamster.png'),
  sloth: require('../../assets/characters/ready-scene-sloth.png'),
  bear: require('../../assets/characters/ready-scene-bear.png'),
};

export function RoutineReadyScreen() {
  const { finishOnboarding, characterId } = useApp();
  const { bottom } = useAppInsets();
  const character = getCharacter(characterId);
  const scene = READY_SCENES[character.id];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.header}>
          <View style={styles.check}>
            <AppText style={styles.checkMark}>✓</AppText>
          </View>
          <AppText variant="title" style={styles.title}>
            나에게 딱 맞는 루틴이{'\n'}완성되었어요.
          </AppText>
          <AppText variant="body" style={styles.sub}>
            모든 준비가 끝났어요.
          </AppText>
        </View>

        <View style={styles.stage}>
          <Image source={scene} style={styles.scene} resizeMode="contain" />
        </View>

        <View style={[styles.bottom, { paddingBottom: layout.onboardCtaBottom + bottom }]}>
          <PrimaryButton label="시작하기" onPress={() => finishOnboarding()} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAF4FF' },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screen,
    paddingTop: (Platform.OS === 'web' ? STATUS_BAR_HEIGHT : space[16]) + 40,
  },
  header: { alignItems: 'center', paddingTop: space[8] },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: colors.white,
    fontFamily: font.extraBold,
    fontSize: 56,
    lineHeight: 60,
    marginTop: -2,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontFamily: font.extraBold,
    color: colors.navy,
    marginTop: space[20],
  },
  sub: { textAlign: 'center', marginTop: space[8], color: colors.muted, fontFamily: font.medium },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -8,
  },
  scene: {
    width: '108%',
    height: 460,
  },
  bottom: { paddingTop: layout.onboardCtaTop },
});
