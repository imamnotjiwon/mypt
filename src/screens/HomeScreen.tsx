import { useEffect, useMemo, useState } from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { MissionRewardDialog } from '../components/MissionRewardDialog';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { WaterMissionDialog } from '../components/WaterMissionDialog';
import { MissionRow } from '../components/MissionRow';
import { getCharacter } from '../data/characters';
import * as api from '../api';
import { Mission, useApp } from '../store/AppProvider';
import { colors, font, layout, radius, space } from '../theme';

const MEDALS: ImageSourcePropType[] = [
  require('../../assets/ui/medal-gold.png'),
  require('../../assets/ui/medal-silver.png'),
  require('../../assets/ui/medal-bronze.png'),
];

const HEADER_H = (Platform.OS === 'web' ? STATUS_BAR_HEIGHT : space[8]) + 40 + space[16];

function todayDeadlineLabel(date = new Date()) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 23:59까지`;
}

export function weekDdayLabel(date = new Date()) {
  const day = date.getDay();
  const left = day === 0 ? 0 : 7 - day;
  return left === 0 ? 'D-DAY' : `D-${left}`;
}

export function HomeScreen() {
  const { go, startMission, token, characterId, nickname, coins, level, xp, streakDays, missions, weeklyStepsGoal, weeklyStepsCurrent, addWater } = useApp();
  const character = getCharacter(characterId);
  const [waterOpen, setWaterOpen] = useState(false);
  const [waterReward, setWaterReward] = useState(false);
  const [friends, setFriends] = useState<api.FriendPreview[]>([]);
  const doneCount = missions.filter((m) => m.done).length;
  const water = missions.find((m) => m.kind === 'water' || m.id === 'water');
  const currentMl = Math.round((water?.current ?? 0) * 1000);
  const targetMl = Math.round((water?.goal ?? 2) * 1000);
  const todayDeadline = useMemo(() => todayDeadlineLabel(), []);
  const weekDday = useMemo(() => weekDdayLabel(), []);

  useEffect(() => {
    if (!token) return;
    api
      .listFriends(token)
      .then((data) => setFriends(data.friends))
      .catch(() => undefined);
  }, [token]);

  const ranking = [
    { key: 'me', name: nickname, weeks: Math.floor(streakDays / 7), id: characterId, me: true },
    ...friends.map((friend) => ({
      key: friend.id,
      name: friend.nickname,
      weeks: Math.floor((friend.streakDays ?? 0) / 7),
      id: getCharacter(friend.characterId).id,
      me: false,
    })),
  ].sort((a, b) => b.weeks - a.weeks);
  const myRank = ranking.findIndex((row) => row.me) + 1;

  const openMission = (mission: Mission) => {
    if (mission.kind === 'water' || mission.id === 'water') setWaterOpen(true);
    else startMission(mission.id);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Image source={require('../../assets/ui/home-hero.png')} style={styles.heroBg} resizeMode="cover" />
            <View style={styles.heroBox}>
              <Image source={character.ready} style={styles.hero} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.levelCard}>
              <View style={styles.rowBetween}>
                <AppText variant="body" style={styles.bold}>
                  LEVEL {level}
                </AppText>
                <AppText variant="caption" style={styles.muted}>
                  {xp} / 1000 XP
                </AppText>
              </View>
              <ProgressBar value={xp / 1000} useGradient />
            </View>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <AppText variant="body" style={styles.bold}>
                  오늘의 미션
                </AppText>
                <View style={styles.badge}>
                  <AppText variant="caption" style={styles.badgeText}>
                    {doneCount}/{missions.length}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" style={[styles.muted, { marginBottom: space[8] }]}>
                {todayDeadline}
              </AppText>
              <ProgressBar value={doneCount / missions.length} />
              {missions.map((mission) => (
                <MissionRow key={mission.id} mission={mission} onPress={() => openMission(mission)} />
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <AppText variant="body" style={styles.bold}>
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
              <View style={styles.weekRow}>
                <View style={styles.walkIcon}>
                  <Image source={require('../../assets/ui/icon-walk.png')} style={styles.walkGlyph} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <AppText variant="body" style={styles.bold}>
                      {weeklyStepsCurrent.toLocaleString()} / {weeklyStepsGoal.toLocaleString()}
                    </AppText>
                    <AppText variant="caption" style={styles.muted}>
                      {Math.round((weeklyStepsCurrent * 100) / weeklyStepsGoal)}%
                    </AppText>
                  </View>
                  <View style={{ marginTop: 12 }}>
                    <ProgressBar value={weeklyStepsCurrent / weeklyStepsGoal} height={8} />
                  </View>
                </View>
              </View>
              <View style={styles.friendBox}>
                <AppText variant="body" style={styles.friendTitle}>
                  친구들 중 {myRank}위! 🔥
                </AppText>
                <View style={styles.friendRow}>
                  <View style={styles.avatars}>
                    {ranking.map((friend, i) => (
                      <Image
                        key={friend.key}
                        source={getCharacter(friend.id).head}
                        style={[styles.mini, { marginLeft: i === 0 ? 0 : -12, zIndex: 3 - i }]}
                      />
                    ))}
                  </View>
                  <Pressable style={styles.friendLink} onPress={() => go('friends')}>
                    <AppText variant="caption" style={styles.link}>
                      친구들 현황 보기
                    </AppText>
                    <Image source={require('../../assets/ui/plus-circle.png')} style={styles.plusBtn} />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.rankTitleRow}>
                  <AppText variant="body" style={styles.bold}>
                    👑 연속 달성 랭킹 <AppText variant="body" style={styles.rankAccent}>{myRank}위</AppText>
                  </AppText>
                </View>
                <View style={styles.badge}>
                  <AppText variant="caption" style={styles.badgeText}>
                    랭킹 더보기
                  </AppText>
                </View>
              </View>
              {ranking.length <= 1 ? (
                <AppText variant="caption" style={styles.muted}>
                  친구를 추가하면 함께 경쟁할 수 있어요
                </AppText>
              ) : (
                <AppText variant="caption" style={styles.muted}>
                  지금이 기회! 랭킹 올려볼까?
                </AppText>
              )}
              {ranking.map((row, i) => (
                <View key={row.key} style={[styles.rankRow, row.me && styles.meRow]}>
                  <Image source={MEDALS[i] ?? MEDALS[2]} style={styles.medal} resizeMode="contain" />
                  <Image source={getCharacter(row.id).head} style={styles.rankHead} />
                  <AppText variant="body" style={styles.rankName}>
                    {row.name}
                  </AppText>
                  <View style={[styles.weekPill, row.me && styles.weekPillMe]}>
                    <AppText variant="caption" style={styles.weekPillTxt}>
                      {row.weeks}주 연속
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <ScreenHeader nickname={nickname} coins={coins} characterId={characterId} onPressProfile={() => go('profile')} />
      </View>
      <BottomNav active="home" onChange={go} />
      {waterOpen && water ? (
        <WaterMissionDialog
          currentMl={currentMl}
          targetMl={targetMl}
          onAdd={(ml) => {
            if (!water) return;
            const willClear = !water.done && currentMl + ml >= targetMl;
            addWater(ml);
            if (willClear) {
              setWaterOpen(false);
              setWaterReward(true);
            }
          }}
          onDismiss={() => setWaterOpen(false)}
        />
      ) : null}
      {waterReward ? (
        <MissionRewardDialog
          character={character.body}
          coinReward={water?.coinReward ?? 200}
          xpReward={water?.xpReward ?? 80}
          level={level}
          currentXp={xp}
          xpAlreadyApplied
          onConfirm={() => setWaterReward(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 4 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingBottom: layout.navInset },
  heroSection: { height: 355 },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 355 },
  heroBox: { height: HEADER_H + 208, paddingTop: HEADER_H, justifyContent: 'flex-end' },
  hero: { width: 168, height: 210, alignSelf: 'center' },
  body: { paddingHorizontal: layout.screen, marginTop: -28 },
  levelCard: {
    backgroundColor: colors.skyCard,
    borderRadius: radius.card,
    padding: space[16],
    gap: space[8],
  },
  card: {
    marginTop: space[16],
    backgroundColor: colors.skyCard,
    borderRadius: radius.card,
    padding: space[16],
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[8] },
  badge: { backgroundColor: '#5F8BB8', borderRadius: 999, paddingHorizontal: space[10], paddingVertical: 2 },
  badgeText: { color: colors.white, fontFamily: font.bold },
  bold: { fontFamily: font.bold },
  muted: { color: colors.gray },
  clear: { color: '#5F8BB8', fontFamily: font.bold },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: space[12], marginTop: space[12] },
  walkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkGlyph: { width: 20, height: 22 },
  friendBox: { backgroundColor: colors.white, borderRadius: radius.card, padding: space[16], marginTop: space[16] },
  friendTitle: { fontFamily: font.bold, color: colors.navy },
  friendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[12] },
  avatars: { flexDirection: 'row' },
  mini: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.white },
  friendLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  plusBtn: { width: 22, height: 22, borderRadius: 11 },
  link: { color: colors.navy, fontFamily: font.bold },
  rankTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 },
  rankAccent: { fontFamily: font.bold, color: '#FFB800' },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[10],
    paddingVertical: space[10],
    paddingHorizontal: space[8],
    borderRadius: 12,
  },
  meRow: { backgroundColor: '#EAF4FF' },
  medal: { width: 24, height: 24 },
  rankHead: { width: 32, height: 32, borderRadius: 16 },
  rankName: { flex: 1, fontFamily: font.bold },
  weekPill: { backgroundColor: '#5F8BB8', borderRadius: 999, paddingHorizontal: space[10], paddingVertical: 4 },
  weekPillMe: { backgroundColor: colors.navy },
  weekPillTxt: { color: colors.white, fontFamily: font.bold },
});
