import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { MissionRow } from '../components/MissionRow';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { getCharacter } from '../data/characters';
import { useSteps } from '../hooks/useSteps';
import { useApp } from '../store/AppProvider';
import { colors, font, gradient, layout, radius, space } from '../theme';
import { weekDdayLabel } from './HomeScreen';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export function QuestScreen() {
  const { go, startMission, nickname, coins, characterId, missions, streakDays, weeklyStepsGoal, weeklyStepsCurrent } = useApp();
  const { todaySteps, week } = useSteps();
  const max = Math.max(...week, 1);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const doneCount = missions.filter((m) => m.done).length;
  const weekDday = weekDdayLabel();
  const weekly = [
    { id: 'walk', title: '이번주 5만 걸음', current: weeklyStepsCurrent, goal: weeklyStepsGoal, unit: '', done: weeklyStepsCurrent >= weeklyStepsGoal },
    ...missions,
    { id: 'squat', title: '스쿼트 30회', current: 0, goal: 30, unit: '회', done: false },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader nickname={nickname} coins={coins} characterId={characterId} onPressProfile={() => go('profile')} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={[...gradient.stats]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.streak}>
            <AppText variant="caption" style={styles.streakLabel}>
              연속 횟수
            </AppText>
            <AppText style={styles.streakNum}>{streakDays}</AppText>
            <AppText variant="body" style={styles.streakSub}>
              연속 운동 중 🔥🔥💪
            </AppText>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="cardTitle" style={styles.cardTitle}>
                오늘의 미션
              </AppText>
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>
                  {doneCount}/{missions.length}
                </AppText>
              </View>
            </View>
            <ProgressBar value={doneCount / missions.length} />
            {missions.map((mission) => (
              <MissionRow
                key={mission.id}
                mission={mission}
                onPress={() => {
                  if (mission.kind === 'water' || mission.id === 'water') go('home');
                  else startMission(mission.id);
                }}
              />
            ))}
          </View>

          <View style={styles.card}>
            <AppText variant="cardTitle" style={styles.cardTitle}>
              오늘 걸음 수
            </AppText>
            <AppText variant="heading" style={styles.steps}>
              {todaySteps.toLocaleString()} / {weeklyStepsGoal.toLocaleString()} steps
            </AppText>
            <View style={styles.bars}>
              {week.map((value, i) => (
                <View key={DAYS[i]} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: 14 + (value / max) * 78,
                        backgroundColor: i === todayIndex ? colors.navy : '#E8EEF4',
                      },
                    ]}
                  />
                  <AppText variant="label" style={[styles.day, i === todayIndex && styles.dayOn]}>
                    {DAYS[i]}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <AppText variant="cardTitle" style={styles.cardTitle}>
                이번주 미션
              </AppText>
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>
                  {weekDday}
                </AppText>
              </View>
            </View>
            <AppText variant="caption" style={styles.muted}>
              이번주 5만 걸음 걸어야 합니다
            </AppText>
            {weekly.map((mission, index) => (
              <MissionRow key={`${mission.id}-${index}`} mission={mission} showBadge={false} />
            ))}
            <View style={styles.friendBox}>
              <AppText variant="body" style={styles.friendTitle}>
                친구들 중 1위! 🔥
              </AppText>
              <View style={styles.friendRow}>
                <View style={styles.avatars}>
                  <Image source={getCharacter(characterId).head} style={styles.mini} />
                </View>
                <Pressable style={styles.friendLink}>
                  <AppText variant="caption" style={styles.link}>
                    친구들 현황 보기
                  </AppText>
                  <Image source={require('../../assets/ui/plus-circle.png')} style={styles.plusBtn} />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav active="quest" onChange={go} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: layout.screen, paddingBottom: layout.navInset, gap: space[16], paddingTop: space[8] },
  streak: { borderRadius: radius.input, padding: space[20] + 2 },
  streakLabel: { color: colors.white, opacity: 0.9 },
  streakNum: { color: colors.white, fontFamily: font.extraBold, fontSize: 48, lineHeight: 56 },
  streakSub: { color: colors.white, fontFamily: font.semiBold },
  card: { backgroundColor: colors.skyCard, borderRadius: radius.card, padding: space[18] },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[8] },
  cardTitle: { color: colors.navy, marginBottom: 0 },
  badge: { backgroundColor: '#5F8BB8', borderRadius: 999, paddingHorizontal: space[10], paddingVertical: 2 },
  badgeText: { color: colors.white, fontFamily: font.bold },
  muted: { color: colors.gray, marginBottom: space[4] },
  steps: { fontFamily: font.extraBold, color: colors.navy, marginBottom: space[32] },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 118, gap: 0, marginTop: space[4] },
  barCol: { flex: 1, alignItems: 'center' },
  bar: {
    width: '100%',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  day: { color: colors.muted, marginTop: 6 },
  dayOn: { color: colors.navy, fontFamily: font.extraBold },
  friendBox: { backgroundColor: colors.white, borderRadius: radius.card, padding: space[16], marginTop: space[16] },
  friendTitle: { fontFamily: font.bold, color: colors.navy },
  friendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[12] },
  avatars: { flexDirection: 'row' },
  mini: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.white },
  friendLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  plusBtn: { width: 22, height: 22, borderRadius: 11 },
  link: { color: colors.navy, fontFamily: font.bold },
});
