import { ReactNode } from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { ProgressRing } from './ProgressRing';
import { STATUS_BAR_HEIGHT } from './PhoneStatusBar';
import { colors, font, layout, radius, space } from '../theme';

export function formatMinSec(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function MissionTopBar({ title, onBack, onClose }: { title: string; onBack: () => void; onClose: () => void }) {
  return (
    <View style={styles.top}>
      <Pressable style={styles.round} onPress={onBack}>
        <Image source={require('../../assets/ui/icon-mission-back.png')} style={styles.navIcon} resizeMode="contain" />
      </Pressable>
      <AppText variant="title" style={styles.topTitle}>
        {title}
      </AppText>
      <Pressable style={styles.round} onPress={onClose}>
        <Image source={require('../../assets/ui/icon-mission-close.png')} style={styles.navIcon} resizeMode="contain" />
      </Pressable>
    </View>
  );
}

export function MissionSummaryCard({
  icon,
  iconSrc,
  taskLabel,
  statusLabel,
  progress,
  progressText,
}: {
  icon?: string;
  iconSrc?: ImageSourcePropType;
  taskLabel: string;
  statusLabel: string;
  progress: number;
  progressText: string;
}) {
  return (
    <View style={styles.summary}>
      <View style={styles.iconCircle}>
        {iconSrc ? (
          <Image source={iconSrc} style={styles.iconImg} resizeMode="contain" />
        ) : (
          <AppText style={styles.icon}>{icon}</AppText>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <AppText variant="body" style={styles.task}>
            {taskLabel}
          </AppText>
          <AppText variant="caption" style={styles.status}>
            {statusLabel}
          </AppText>
        </View>
        <View style={{ marginTop: space[8] }}>
          <ProgressBar value={progress} height={6} />
        </View>
        <AppText variant="caption" style={styles.meta}>
          {progressText}
        </AppText>
      </View>
    </View>
  );
}

export function MissionProgressRing({
  progress,
  topLabel,
  centerValue,
  bottomLabel,
}: {
  progress: number;
  topLabel: string;
  centerValue: string;
  bottomLabel: string;
}) {
  return (
    <View style={styles.ringWrap}>
      <ProgressRing progress={progress} size={260} stroke={18}>
        <AppText variant="caption" style={styles.meta}>
          {topLabel}
        </AppText>
        <AppText style={styles.center}>{centerValue}</AppText>
        <AppText variant="caption" style={styles.meta}>
          {bottomLabel}
        </AppText>
      </ProgressRing>
    </View>
  );
}

export function cardioSessionStats(title: string, minutes: number, targetMin: number) {
  const p = minutes / Math.max(1, targetMin);
  const kcal = (perMin: number) => String(Math.max(0, Math.round(minutes * perMin)));
  const name = title;

  if (/요가|스트레칭|폼롤러/.test(name)) {
    return [
      { icon: '🔥', tint: '#E05C6E', label: '예상 칼로리', value: kcal(4), unit: 'kcal' },
      { icon: '🌬️', tint: '#33A1C3', label: '호흡', value: String(Math.round(minutes * 5)), unit: '회' },
      { icon: '✨', tint: '#7B5EA7', label: '유연성', value: String(Math.round(p * 100)), unit: '%' },
    ];
  }
  if (/플랭크/.test(name)) {
    return [
      { icon: '🔥', tint: '#E05C6E', label: '예상 칼로리', value: kcal(5), unit: 'kcal' },
      { icon: '⏱️', tint: '#33A1C3', label: '유지 시간', value: formatMinSec(minutes * 60) },
      { icon: '💪', tint: '#2E9E63', label: '코어 집중', value: String(Math.round(p * 100)), unit: '%' },
    ];
  }
  if (/자전거/.test(name)) {
    return [
      { icon: '🔥', tint: '#E05C6E', label: '예상 칼로리', value: kcal(8), unit: 'kcal' },
      { icon: '📍', tint: '#33A1C3', label: '예상 거리', value: (minutes * 0.28).toFixed(2), unit: 'km' },
      { icon: '🚴', tint: '#2E9E63', label: '케이던스', value: String(Math.round(55 + p * 25)), unit: 'rpm' },
    ];
  }
  if (/걷기/.test(name)) {
    return [
      { icon: '🔥', tint: '#E05C6E', label: '예상 칼로리', value: kcal(5), unit: 'kcal' },
      { icon: '📍', tint: '#33A1C3', label: '예상 거리', value: (minutes * 0.08).toFixed(2), unit: 'km' },
      { icon: '🚶', tint: '#2E9E63', label: '걸음 수', value: Math.round(minutes * 110).toLocaleString(), unit: '걸음' },
    ];
  }
  if (/계단/.test(name)) {
    return [
      { icon: '🔥', tint: '#E05C6E', label: '예상 칼로리', value: kcal(7), unit: 'kcal' },
      { icon: '📶', tint: '#33A1C3', label: '오른 층', value: String(Math.round(minutes * 1.2)), unit: '층' },
      { icon: '🚶', tint: '#2E9E63', label: '걸음 수', value: Math.round(minutes * 90).toLocaleString(), unit: '걸음' },
    ];
  }
  if (/달리기|런닝/.test(name)) {
    return [
      { icon: '🔥', tint: '#E05C6E', label: '예상 칼로리', value: kcal(10), unit: 'kcal' },
      { icon: '📍', tint: '#33A1C3', label: '예상 거리', value: (minutes * 0.12).toFixed(2), unit: 'km' },
      { icon: '🚶', tint: '#2E9E63', label: '걸음 수', value: Math.round(minutes * 140).toLocaleString(), unit: '걸음' },
    ];
  }
  return [
    { icon: '🔥', tint: '#E05C6E', label: '예상 칼로리', value: kcal(6), unit: 'kcal' },
    { icon: '❤️', tint: '#33A1C3', label: '평균 심박수', value: String(Math.round(95 + p * 35)), unit: 'bpm' },
    { icon: '⚡', tint: '#2E9E63', label: '운동 강도', value: String(Math.round(p * 100)), unit: '%' },
  ];
}

export function repsSessionStats(title: string, current: number, target: number) {
  const p = current / Math.max(1, target);
  const kcal = String(Math.round(current * 0.4));
  let zone = '전신';
  let detail = '(코어 어깨)';
  if (/푸쉬업|벤치|프레스/.test(title) && !/숄더|레그/.test(title)) {
    zone = '상체';
    detail = '(가슴 팔 어깨)';
  } else if (/숄더/.test(title)) {
    zone = '어깨';
    detail = '(삼각근)';
  } else if (/스쿼트|런지|레그/.test(title)) {
    zone = '하체';
    detail = '(허벅지 엉덩이)';
  } else if (/데드/.test(title)) {
    zone = '후면';
    detail = '(허리 햄스트링)';
  } else if (/로우|랫풀/.test(title)) {
    zone = '등';
    detail = '(광배 후면)';
  } else if (/버피/.test(title)) {
    zone = '전신';
    detail = '(심폐 근력)';
  }
  return [
    { iconSrc: require('../../assets/ui/stat-flame.png') as ImageSourcePropType, label: '예상 칼로리', value: kcal, unit: 'kcal' },
    { iconSrc: require('../../assets/ui/stat-arm.png') as ImageSourcePropType, label: '근력 자극', value: zone, unit: detail },
    { iconSrc: require('../../assets/ui/stat-timer.png') as ImageSourcePropType, label: '진행률', value: String(Math.round(p * 100)), unit: '%' },
  ];
}

export function MissionStatsRow({
  stats,
}: {
  stats: { icon?: string; iconSrc?: ImageSourcePropType; tint?: string; label: string; value: string; unit?: string }[];
}) {
  return (
    <View style={styles.stats}>
      {stats.map((stat, i) => (
        <View key={stat.label} style={styles.stat}>
          {i > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.statInner}>
            {stat.iconSrc ? (
              <Image source={stat.iconSrc} style={styles.statGlyph} resizeMode="contain" />
            ) : (
              <AppText style={[styles.statIcon, { color: stat.tint }]}>{stat.icon}</AppText>
            )}
            <AppText variant="caption" style={styles.meta}>
              {stat.label}
            </AppText>
            <AppText variant="body" style={styles.statValue}>
              {stat.value}
            </AppText>
            {stat.unit ? (
              <AppText variant="caption" style={styles.meta}>
                {stat.unit}
              </AppText>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function MissionScreenFrame({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={['#EAF4FF', colors.white]} style={styles.frame}>
      <View style={styles.framePad}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, position: 'relative' },
  framePad: {
    flex: 1,
    paddingHorizontal: layout.screen,
    paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 0,
  },
  top: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: {
    position: 'absolute',
    left: 48,
    right: 48,
    top: 0,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 22,
    color: colors.navy,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  navIcon: { width: 40, height: 40 },
  summary: {
    flexDirection: 'row',
    gap: space[12],
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: space[16],
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.skyCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  iconImg: { width: 32, height: 32, borderRadius: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  task: { fontFamily: font.bold, flex: 1 },
  status: { color: '#9C27B0', fontFamily: font.bold },
  ringWrap: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  meta: { color: colors.gray, marginTop: 4, textAlign: 'center' },
  center: { fontFamily: font.extraBold, fontSize: 36, lineHeight: 44, color: colors.navy, textAlign: 'center' },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#ECFDF5',
    paddingVertical: space[16],
  },
  stat: { flex: 1, flexDirection: 'row' },
  divider: { width: 1, backgroundColor: '#ECFDF5', marginVertical: 4 },
  statInner: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  statIcon: { fontSize: 18, lineHeight: 22, marginBottom: 4 },
  statGlyph: { width: 22, height: 22, marginBottom: 4 },
  statValue: { fontFamily: font.bold, textAlign: 'center' },
});
