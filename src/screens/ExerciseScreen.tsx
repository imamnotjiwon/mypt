import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { ExerciseCalendar } from '../components/ExerciseCalendar';
import { ScreenHeader } from '../components/ScreenHeader';
import { getCharacter } from '../data/characters';
import { useApp } from '../store/AppProvider';
import { colors, font, layout, radius, shadow, space } from '../theme';

const EXERCISES = [
  { icon: require('../../assets/ui/exercise-run.png'), title: '달리기', subtitle: 'Running', value: '0km' },
  { icon: require('../../assets/ui/exercise-weights.png'), title: '웨이트 트레이닝', subtitle: 'Weights', value: '0h' },
  { icon: require('../../assets/ui/exercise-cycle.png'), title: '자전거 타기', subtitle: 'Cycling', value: '0km' },
];
const WEEK = [
  { label: '월', value: 0.38 },
  { label: '화', value: 0.72 },
  { label: '수', value: 1 },
  { label: '목', value: 0.48 },
  { label: '금', value: 0.86 },
  { label: '토', value: 0.18 },
  { label: '일', value: 0.36 },
];
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

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
  const { go, nickname, coins, characterId } = useApp();
  const character = getCharacter(characterId);
  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedIndex = useMemo(() => (selected.getDay() + 6) % 7, [selected]);
  const monthLabel = `${selected.getMonth() + 1}월`;
  const weekLabel = `${monthLabel} ${Math.ceil(selected.getDate() / 7)}주차 요약`;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#CDE4FD', colors.white]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader nickname={nickname} coins={coins} characterId={characterId} onPressProfile={() => go('profile')} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.dateNav}>
            <Pressable onPress={() => setSelected((d) => shiftDate(d, -1))} hitSlop={8}>
              <AppText style={styles.chevron}>‹</AppText>
            </Pressable>
            <Pressable onPress={() => setCalendarOpen(true)} hitSlop={8}>
              <AppText style={styles.dateTxt}>{formatDot(selected)}</AppText>
            </Pressable>
            <Pressable onPress={() => setSelected((d) => shiftDate(d, 1))} hitSlop={8}>
              <AppText style={styles.chevron}>›</AppText>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <AppText>📅</AppText>
              <AppText variant="body" style={styles.bold}>
                {formatLong(selected)}
              </AppText>
            </View>
            {EXERCISES.map((item) => (
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
            <View style={styles.todayStage}>
              <Image source={require('../../assets/ui/character-base.png')} style={styles.pedestal} resizeMode="contain" />
              <Image source={character.body} style={styles.today} resizeMode="contain" />
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
              {WEEK.map((day, i) => {
                const on = i === selectedIndex;
                return (
                  <View key={day.label} style={styles.barCol}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: 18 + day.value * 108,
                          backgroundColor: on ? colors.navy : '#E8EEF4',
                        },
                      ]}
                    />
                    <AppText variant="caption" style={[styles.day, on && styles.dayOn]}>
                      {day.label}
                    </AppText>
                  </View>
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
                  주간 총 소요 시간: 3시간 15분
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
                  주간 칼로리 소모: 1,500 kcal
                </AppText>
              </View>
            </View>
          </View>

          <LinearGradient colors={['#1A4B8C', '#3BA7C9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.insight}>
            <AppText variant="body" style={styles.insightTitle}>
              오늘의 인사이트
            </AppText>
            <AppText variant="body" style={styles.insightBody}>
              지난주보다 운동량이 15% 증가했어요!
            </AppText>
            <AppText variant="body" style={styles.insightBody}>
              이대로라면 곧 레벨업이에요
            </AppText>
            <AppText variant="body" style={styles.insightBody}>
              {nickname}도 함께 성장하면서 점점 더 건강해지고 있어요 ✨
            </AppText>
            <View style={styles.insightBtn}>
              <AppText variant="caption" style={styles.insightBtnTxt}>
                자세히 보기
              </AppText>
            </View>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
      <BottomNav active="exercise" onChange={go} />
      {calendarOpen ? (
        <ExerciseCalendar
          selected={selected}
          today={today}
          onSelect={(date) => {
            setSelected(date);
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
  scroll: { paddingHorizontal: layout.screen, paddingTop: space[8], paddingBottom: layout.navInset, gap: space[16] },
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
    marginTop: space[24],
    marginBottom: space[4],
    ...shadow.soft,
  },
  chevron: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, color: colors.navy, width: 28, height: 28, textAlign: 'center' },
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
    bottom: 10,
    width: 210,
    height: 58,
  },
  today: { width: 168, height: 196, zIndex: 1 },
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
