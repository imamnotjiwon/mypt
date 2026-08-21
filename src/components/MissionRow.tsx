import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { Mission } from '../store/AppProvider';
import { colors, font, space } from '../theme';
import { formatMinSec } from './MissionSession';

const ICONS: Record<string, ImageSourcePropType> = {
  water: require('../../assets/ui/icon-water.png'),
  pushup: require('../../assets/ui/icon-pushup.png'),
  cardio: require('../../assets/ui/icon-cardio.png'),
  walk: require('../../assets/ui/icon-walk.png'),
  squat: require('../../assets/ui/icon-squat.png'),
};

type Row = {
  id: string;
  title: string;
  current: number;
  goal: number;
  unit: string;
  done: boolean;
  icon?: string;
};

type Props = {
  mission: Row | Mission;
  onPress?: () => void;
  showBadge?: boolean;
};

export function MissionRow({ mission, onPress, showBadge = true }: Props) {
  const raster = ICONS[mission.icon ?? ''] ?? ICONS[mission.id] ?? ICONS.cardio;
  const ratio = mission.done ? 1 : mission.current / mission.goal;
  return (
    <Pressable style={styles.mission} onPress={onPress} disabled={!onPress}>
      <View style={styles.missionIcon}>
        <Image source={raster} style={styles.missionGlyph} resizeMode="contain" />
        {showBadge ? (
          <Image
            source={mission.done ? require('../../assets/ui/icon-check.png') : require('../../assets/ui/plus-circle.png')}
            style={styles.badgeImg}
          />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <AppText variant="body" style={styles.missionTitle}>
            {mission.title}
          </AppText>
          <AppText variant="caption" style={[styles.muted, mission.done && styles.clear]}>
            {mission.done
              ? 'Clear'
              : mission.unit === '분'
                ? `${formatMinSec(Math.round(mission.current * 60))} / ${formatMinSec(mission.goal * 60)}`
                : `${mission.current}/${mission.goal}${mission.unit}`}
          </AppText>
        </View>
        <View style={{ marginTop: 6 }}>
          <ProgressBar value={ratio} height={6} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mission: { flexDirection: 'row', alignItems: 'center', gap: space[12], paddingTop: space[16], overflow: 'visible' },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  missionGlyph: { width: 26, height: 26 },
  badgeImg: { position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: 7 },
  missionTitle: { fontFamily: font.bold },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: colors.gray },
  clear: { color: '#5F8BB8', fontFamily: font.bold },
});
