import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { FallingParticles } from './FallingParticles';
import { CoinMark } from './Marks';
import { PrimaryButton } from './PrimaryButton';
import { ProgressBar } from './ProgressBar';
import { useAppInsets } from '../hooks/useAppInsets';
import { colors, font, layout, radius, space } from '../theme';

type Props = {
  character: ImageSourcePropType;
  coinReward: number;
  xpReward: number;
  level: number;
  currentXp: number;
  maxXp?: number;
  xpAlreadyApplied?: boolean;
  kicker?: string;
  title?: string;
  sub?: string;
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
  kicker = '미션 성공 축하합니다!',
  title = '수고했습니다!',
  sub = '오늘도 한 걸음 성장했어요!',
  onConfirm,
}: Props) {
  const { top, bottom } = useAppInsets();
  const fromXp = xpAlreadyApplied ? Math.max(0, currentXp - xpReward) : currentXp;
  const toXp = xpAlreadyApplied ? currentXp : Math.min(maxXp, currentXp + xpReward);

  return (
    <View style={[styles.root, { paddingTop: top + space[24], paddingBottom: bottom + space[16] }]}>
      <FallingParticles />
      <View style={styles.header}>
        <AppText variant="caption" style={styles.kicker}>
          {kicker}
        </AppText>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.sub}>{sub}</AppText>
      </View>
      <View style={styles.heroWrap}>
        <Image source={character} style={styles.hero} resizeMode="contain" />
      </View>
      <View style={styles.bottom}>
        <View style={styles.rewards}>
          <View style={styles.reward}>
            <View style={styles.rewardIconWrap}>
              <CoinMark size={28} />
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
        <View style={styles.ctaGap}>
          <PrimaryButton label="돌아가기" onPress={onConfirm} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EAF4FF',
    paddingHorizontal: layout.screen,
    alignItems: 'center',
    zIndex: 30,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: space[12],
  },
  kicker: { color: colors.teal, fontFamily: font.bold, fontSize: 13, lineHeight: 18 },
  title: {
    textAlign: 'center',
    color: colors.navyDeep,
    marginTop: space[10],
    fontFamily: font.extraBold,
    fontSize: 36,
    lineHeight: 44,
  },
  sub: {
    textAlign: 'center',
    color: colors.teal,
    marginTop: space[8],
    fontFamily: font.bold,
    fontSize: 18,
    lineHeight: 26,
  },
  heroWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    marginTop: space[8],
    marginBottom: space[8],
  },
  hero: {
    width: '92%',
    maxWidth: 300,
    height: '100%',
    maxHeight: 300,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '100%',
    gap: space[12],
  },
  ctaGap: {
    marginTop: space[12],
    paddingTop: space[8],
  },
});
