import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, layout, space } from '../theme';
import { useApp } from '../store/AppProvider';

export function WelcomeScreen() {
  const { go } = useApp();

  return (
    <View style={styles.flex}>
      <Image source={require('../../assets/ui/bg-welcome.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.heroWrap}>
          <Image source={require('../../assets/characters/highfive.png')} style={styles.hero} resizeMode="contain" />
        </View>
        <AppText variant="display" style={styles.title}>
          환영합니다! 지금부터{'\n'}
          <AppText variant="display" style={styles.accent}>
            나만의 루틴
          </AppText>
          을 만들어 볼까요?
        </AppText>
        <AppText variant="sub" style={styles.sub}>
          설문에 참여하고 나만의 맞춤루틴과{'\n'}동물 캐릭터를 만나보세요.
        </AppText>
        <View style={styles.bottom}>
          <PrimaryButton label="설문조사" onPress={() => go('survey')} />
          <View style={styles.timeRow}>
            <Image source={require('../../assets/ui/icon-timer.png')} style={styles.timer} />
            <AppText variant="time" style={styles.time}>
              1분 30초 소요
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screen,
  },
  heroWrap: {
    height: '46%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  hero: {
    width: 320,
    height: 248,
  },
  title: {
    marginTop: space[20],
    textAlign: 'center',
    color: colors.black,
  },
  accent: {
    color: colors.navy,
  },
  sub: {
    marginTop: space[16],
    textAlign: 'center',
    fontSize: 17,
    color: colors.muted,
  },
  bottom: {
    marginTop: 'auto',
    paddingBottom: space[24],
    alignItems: 'center',
    gap: space[12],
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timer: { width: 12, height: 12 },
  time: {
    color: colors.body,
  },
});
