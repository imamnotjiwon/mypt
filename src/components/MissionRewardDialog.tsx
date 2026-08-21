import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { FallingParticles } from './FallingParticles';
import { PrimaryButton } from './PrimaryButton';
import { ProgressBar } from './ProgressBar';
import { colors, font, layout, radius, space } from '../theme';

type Props = {
  character: ImageSourcePropType;
  coinReward: number;
  xpReward: number;
  level: number;
  currentXp: number;
  maxXp?: number;
  xpAlreadyApplied?: boolean;
  onConfirm: () => void;
};

export function MissionRewardDialog({
  character,
  coinReward,
  xpReward,
  level,
  currentXp,
  maxXp = 1000,
  xpAlreadyApplied = false,
  onConfirm,
}: Props) {
  const fromXp = xpAlreadyApplied ? Math.max(0, currentXp - xpReward) : currentXp;
  const toXp = xpAlreadyApplied ? currentXp : Math.min(maxXp, currentXp + xpReward);

  return (
    <View style={styles.root}>
      <FallingParticles />
      <AppText variant="caption" style={styles.kicker}>
        미션 성공 축하합니다!
      </AppText>
      <AppText variant="title" style={styles.title}>
        수고했습니다!
      </AppText>
      <AppText variant="body" style={styles.sub}>
        오늘도 한 걸음 성장했어요!
      </AppText>
      <Image source={character} style={styles.hero} resizeMode="contain" />
      <View style={styles.bottom}>
        <View style={styles.rewards}>
          <View style={styles.reward}>
            <View style={styles.rewardIconWrap}>
              <Image source={require('../../assets/ui/reward-coin.png')} style={styles.rewardIcon} resizeMode="cover" />
            </View>
            <AppText style={styles.rewardVal}>+{coinReward}</AppText>
            <AppText variant="caption" style={styles.muted}>
              코인 획득
            </AppText>
          </View>
          <View style={styles.reward}>
            <View style={styles.rewardIconWrap}>
              <Image source={require('../../assets/ui/reward-xp.png')} style={styles.rewardIcon} resizeMode="cover" />
            </View>
            <AppText style={styles.rewardVal}>+{xpReward}</AppText>
            <AppText variant="caption" style={styles.muted}>
              경험치 획득
            </AppText>
          </View>
        </View>
        <View style={styles.level}>
          <View style={styles.row}>
            <AppText variant="body" style={styles.levelTxt}>
              LEVEL {level}
            </AppText>
            <AppText variant="caption" style={styles.muted}>
              {toXp} / {maxXp} XP
            </AppText>
          </View>
          <ProgressBar value={toXp / maxXp} animateFrom={fromXp / maxXp} useGradient />
        </View>
        <PrimaryButton label="돌아가기" onPress={onConfirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EAF4FF',
    paddingHorizontal: layout.screen,
    paddingTop: 60,
    alignItems: 'center',
    zIndex: 30,
  },
  kicker: { color: colors.teal, fontFamily: font.bold },
  title: {
    textAlign: 'center',
    color: colors.navyDeep,
    marginTop: space[8],
    fontFamily: font.extraBold,
    fontSize: 30,
    lineHeight: 38,
  },
  sub: {
    textAlign: 'center',
    color: colors.teal,
    marginTop: space[8],
    fontFamily: font.bold,
    fontSize: 18,
    lineHeight: 26,
  },
  hero: { width: '100%', flex: 1, maxHeight: 360, marginTop: space[8] },
  rewards: { flexDirection: 'row', gap: space[8], width: '100%' },
  reward: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingVertical: space[16],
    alignItems: 'center',
  },
  rewardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  rewardIcon: {
    width: 44,
    height: 44,
  },
  rewardVal: { fontFamily: font.extraBold, fontSize: 24, lineHeight: 32, color: colors.navyDeep, marginTop: space[8] },
  muted: { color: colors.gray },
  level: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: space[16],
    gap: space[8],
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  levelTxt: { fontFamily: font.bold },
  bottom: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: space[24],
    paddingTop: space[12],
    gap: space[12],
  },
});
