import { useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { ExerciseCalendar } from '../components/ExerciseCalendar';
import { ScreenHeader } from '../components/ScreenHeader';
import { pickDailyInsight } from '../data/insights';
import { getCharacter } from '../data/characters';
import { heroBodySource } from '../data/outfit';
import { todayKey } from '../data/missions';
import { daysInWeek, dayForDate, formatClock, formatHours, formatKm, sumDays, weekDates } from '../data/workoutLog';
import { FloorShadow } from '../components/FloorShadow';
import { useAppInsets } from '../hooks/useAppInsets';
import { useDesignScale } from '../hooks/useDesignScale';
import { useApp } from '../store/AppProvider';
import { colors, font, layout, radius, shadow, space } from '../theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function shiftDate(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDot(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function formatLong(date: Date) {
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()} (${WEEKDAYS[date.getDay()]})`;
}

export function ExerciseScreen() {
  const { go, nickname, coins, characterId, openCoinShop, userId, workoutLogs, missions, equippedItem } = useApp();
  const { navInset } = useAppInsets();
  const s = useDesignScale();
  const blurTarget = useRef<View>(null);
  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedIndex = useMemo(() => (selected.getDay() + 6) % 7, [selected]);
  const monthLabel = `${selected.getMonth() + 1}월`;
  const weekLabel = `${monthLabel} ${Math.ceil(selected.getDate() / 7)}주차 요약`;
  const insight = useMemo(
    () => pickDailyInsight({ nickname, userId, logs: workoutLogs, missions }),
    [nickname, userId, workoutLogs, missions],
  );
  const selectedKey = todayKey(selected);
  const isToday = selectedKey === todayKey(today);
  const day = dayForDate(workoutLogs, selectedKey, isToday ? missions : undefined);
  const weekDays = daysInWeek(workoutLogs, selected, missions);
  const weekSum = sumDays(weekDays);
  const weekMax = Math.max(...weekDays.map((row) => row.minutes), 1);
  const exercises = [
    { icon: require('../../assets/ui/exercise-run.png'), title: '달리기', subtitle: 'Running', value: formatKm(day.runKm) },
    { icon: require('../../assets/ui/exercise-weights.png'), title: '웨이트 트레이닝', subtitle: 'Weights', value: formatHours(day.weightsMin) },
    { icon: require('../../assets/ui/exercise-cycle.png'), title: '자전거 타기', subtitle: 'Cycling', value: formatKm(day.cycleKm) },
  ];
  const canGoNext = todayKey(shiftDate(selected, 1)) <= todayKey(today);

  return (
    <View style={styles.root}>
      <BlurTargetView ref={blurTarget} style={styles.safe}>
      <LinearGradient colors={['#CDE4FD', colors.white]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={[]}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: navInset }]} showsVerticalScrollIndicator={false}>
          <View style={styles.headerBleed}>
            <ScreenHeader nickname={nickname} coins={coins} characterId={characterId} onPressProfile={() => go('profile')} onPressCoins={openCoinShop} compact />
          </View>
          <View style={styles.dateNav}>
            <Pressable onPress={() => setSelected((d) => shiftDate(d, -1))} hitSlop={16} style={styles.chevronHit}>
              <AppText style={styles.chevron}>‹</AppText>
            </Pressable>
            <Pressable onPress={() => setCalendarOpen(true)} hitSlop={12} style={styles.dateHit}>
              <AppText style={styles.dateTxt}>{formatDot(selected)}</AppText>
            </Pressable>
            <Pressable
              onPress={() => canGoNext && setSelected((d) => shiftDate(d, 1))}
              hitSlop={16}
              style={[styles.chevronHit, !canGoNext && styles.chevronOff]}
              disabled={!canGoNext}
            >
              <AppText style={[styles.chevron, !canGoNext && styles.chevronMuted]}>›</AppText>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <AppText>📅</AppText>
              <AppText variant="body" style={styles.bold}>
                {formatLong(selected)}
              </AppText>
            </View>
            {day.minutes <= 0 ? (
              <AppText variant="caption" style={[styles.muted, { marginBottom: space[8] }]}>
                {isToday ? '오늘의 미션을 하면 여기에 기록이 쌓여요' : '이 날은 운동 기록이 없어요'}
              </AppText>
            ) : null}
            {exercises.map((item) => (
              <View key={item.title} style={styles.exRow}>
                <Image source={item.icon} style={styles.exGlyph} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <AppText variant="body" style={styles.bold}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" style={styles.muted}>
                    {item.subtitle}
                  </AppText>
                </View>
                <AppText variant="body" style={styles.value}>
                  {item.value}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <AppText variant="body" style={styles.bold}>
              오늘의 모습
            </AppText>
            <AppText variant="caption" style={styles.muted}>
              {monthLabel}의 나, 조금씩 변화 중
            </AppText>
            <View style={[styles.todayStage, { height: Math.round(220 * s) }]}>
              {(() => {
                const character = getCharacter(characterId);
                const w = Math.round(118 * character.bodyScale * s);
                const h = Math.round(138 * character.bodyScale * s);
                const nudge = Math.round(w * (character.nudgeX ?? 0));
                return (
                  <>
                    <Image
                      source={heroBodySource(characterId, equippedItem)}
                      style={{
                        width: w,
                        height: h,
                        zIndex: 2,
                        transform: [{ translateX: nudge }],
                      }}
                      resizeMode="contain"
                    />
                    <FloorShadow
                      width={Math.round(w * 0.72)}
                      height={Math.round(18 * s)}
                      style={[styles.pedestal, { transform: [{ translateX: nudge }] }]}
                    />
                  </>
                );
              })()}
            </View>
          </View>

          <View style={styles.card}>
            <AppText variant="body" style={styles.weekTitle}>
              주간 활동
            </AppText>
            <AppText variant="caption" style={styles.weekSub}>
              {weekLabel}
            </AppText>
            <View style={styles.chart}>
              {weekDays.map((row, i) => {
                const on = i === selectedIndex;
                return (
                  <Pressable
                    key={WEEK_LABELS[i]}
                    style={styles.barCol}
                    onPress={() => {
                      const next = weekDates(selected)[i];
                      if (todayKey(next) > todayKey(today)) return;
                      setSelected(next);
                    }}
                    hitSlop={6}
                  >
                    <View
                      style={[
                        styles.bar,
                        {
                          height: 18 + (row.minutes / weekMax) * 108,
                          backgroundColor: on ? colors.navy : '#E8EEF4',
                        },
                      ]}
                    />
                    <AppText variant="caption" style={[styles.day, on && styles.dayOn]}>
                      {WEEK_LABELS[i]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.stat}>
              <Image source={require('../../assets/ui/stat-total.png')} style={styles.statImg} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={styles.totalLabel}>
                  TOTAL TIME
                </AppText>
                <AppText variant="body" style={styles.statText}>
                  주간 총 소요 시간: {formatClock(weekSum.minutes)}
                </AppText>
              </View>
            </View>
            <View style={[styles.stat, styles.calStat]}>
              <Image source={require('../../assets/ui/stat-calorie.png')} style={styles.statImg} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={styles.calLabel}>
                  CALORIES
                </AppText>
                <AppText variant="body" style={styles.statText}>
                  주간 칼로리 소모: {Math.round(weekSum.kcal).toLocaleString()} kcal
                </AppText>
              </View>
            </View>
          </View>

          <LinearGradient colors={['#1A4B8C', '#3BA7C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.insight}>
            <AppText variant="body" style={styles.insightTitle}>
              오늘의 인사이트
            </AppText>
            <AppText variant="body" style={styles.insightBody}>
              {insight.headline}
            </AppText>
            <AppText variant="body" style={styles.insightBody}>
              {insight.detail}
            </AppText>
            <AppText variant="body" style={styles.insightBody}>
              {insight.footer}
            </AppText>
            <Pressable style={styles.insightBtn} onPress={() => go('quest')} hitSlop={8}>
              <AppText variant="caption" style={styles.insightBtnTxt}>
                오늘의 미션 하러 가기
              </AppText>
            </Pressable>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
      <BottomNav active="exercise" onChange={go} />
      </BlurTargetView>
      {calendarOpen ? (
        <ExerciseCalendar
          selected={selected}
          today={today}
          blurTarget={blurTarget}
          onSelect={(date) => {
            setSelected(todayKey(date) > todayKey(today) ? today : date);
            setCalendarOpen(false);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  headerBleed: { marginHorizontal: -layout.screen },
  scroll: { paddingHorizontal: layout.screen, paddingTop: 0, gap: space[16] },
  dateNav: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 248,
    marginTop: 0,
    marginBottom: space[4],
    ...shadow.soft,
  },
  chevronHit: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chevronOff: { opacity: 0.35 },
  chevron: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: colors.navy, width: 28, height: 28, textAlign: 'center' },
  chevronMuted: { color: colors.gray },
  dateHit: { minHeight: 40, justifyContent: 'center' },
  dateTxt: { fontFamily: font.bold, fontSize: 16, lineHeight: 28, color: colors.navy, textAlign: 'center', minWidth: 120 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: space[16] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[8], marginBottom: space[12] },
  bold: { fontFamily: font.bold },
  muted: { color: colors.gray },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: radius.card,
    padding: space[16],
    marginBottom: space[8],
    gap: space[12],
  },
  exGlyph: { width: 40, height: 40 },
  value: { fontFamily: font.bold, color: colors.navy },
  todayStage: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: space[8],
  },
  pedestal: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  weekTitle: { fontFamily: font.extraBold, color: colors.black },
  weekSub: { color: '#7A93B0', marginTop: 2 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 148, marginTop: space[16], gap: 0 },
  barCol: { flex: 1, alignItems: 'center' },
  bar: {
    width: '100%',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  day: { color: colors.gray, marginTop: 8 },
  dayOn: { color: colors.navy, fontFamily: font.bold },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    backgroundColor: '#E8F2FE',
    borderRadius: 20,
    paddingVertical: space[16],
    paddingHorizontal: space[16],
    marginTop: space[12],
  },
  calStat: { backgroundColor: '#FFF0F3' },
  statImg: { width: 44, height: 44, borderRadius: 22 },
  totalLabel: { color: '#1A3E6D', fontFamily: font.bold, letterSpacing: 0.6 },
  calLabel: { color: '#FF6B6B', fontFamily: font.bold, letterSpacing: 0.6 },
  statText: { fontFamily: font.medium, color: colors.black, marginTop: 2 },
  insight: {
    borderRadius: 28,
    padding: space[24],
  },
  insightTitle: { fontFamily: font.bold, color: colors.white, marginBottom: space[12] },
  insightBody: { color: colors.white, marginBottom: 4 },
  insightBtn: {
    alignSelf: 'flex-start',
    marginTop: space[16],
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: space[16],
    paddingVertical: 8,
  },
  insightBtnTxt: { color: colors.white, fontFamily: font.bold },
});
