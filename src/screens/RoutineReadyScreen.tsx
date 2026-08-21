import { Image, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { CharacterId, getCharacter } from '../data/characters';
import { colors, font, layout, shadow, space } from '../theme';
import { useApp } from '../store/AppProvider';

const BUBBLES: Record<CharacterId, { bg: string; border: string; text: string }> = {
  otter: { bg: '#F6E6D4', border: '#C4A07A', text: '#7B5032' },
  rabbit: { bg: '#FDE8F0', border: '#E8A0B8', text: '#8B4560' },
  cat: { bg: '#FDE8E8', border: '#E07070', text: '#8B3A3A' },
  gorilla: { bg: '#FFFFFF', border: '#5B8FC7', text: '#194373' },
  dog: { bg: '#FFF0E0', border: '#E8A050', text: '#8B5A20' },
  hamster: { bg: '#E8F5D8', border: '#7CB342', text: '#4A6B2A' },
  sloth: { bg: '#F0E6FA', border: '#9B7BB8', text: '#5A3D7A' },
  bear: { bg: '#FFF6D8', border: '#E8C04A', text: '#7A5A10' },
};

export function RoutineReadyScreen() {
  const { finishOnboarding, characterId } = useApp();
  const character = getCharacter(characterId);
  const bubble = BUBBLES[character.id];

  return (
    <View style={styles.root}>
      <Image source={require('../../assets/ui/bg-routine-ready.png')} style={styles.bg} resizeMode="cover" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
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
          <View style={styles.heroCluster}>
            <View style={[styles.bubble, { backgroundColor: bubble.bg, borderColor: bubble.border }]}>
              <AppText style={[styles.quote, { color: bubble.text }]}>
                놀랐지? 함께 운동하면{'\n'}우린 성장할 거야
              </AppText>
              <View style={[styles.tail, { backgroundColor: bubble.bg, borderColor: bubble.border }]} />
            </View>
            <Image source={character.ready} style={styles.hero} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton label="시작하기" onPress={() => finishOnboarding()} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAF4FF' },
  bg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screen,
    paddingTop: (Platform.OS === 'web' ? STATUS_BAR_HEIGHT : space[16]) + space[8],
  },
  header: { alignItems: 'center' },
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: colors.white,
    fontFamily: font.extraBold,
    fontSize: 32,
    lineHeight: 36,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontFamily: font.extraBold,
    color: colors.navy,
    marginTop: space[16],
  },
  sub: { textAlign: 'center', marginTop: space[6], color: colors.muted, fontFamily: font.medium },
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 280,
  },
  heroCluster: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    left: 8,
    top: 12,
    width: 186,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 14,
    zIndex: 3,
    ...shadow.soft,
  },
  tail: {
    position: 'absolute',
    right: 18,
    bottom: -7,
    width: 14,
    height: 14,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  quote: {
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  hero: {
    position: 'absolute',
    right: -8,
    bottom: 0,
    width: 220,
    height: 260,
    zIndex: 2,
  },
  bottom: { paddingBottom: space[20], paddingTop: space[8] },
});
