import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { BackGlyph } from '../components/NavGlyph';
import { CoinMark } from '../components/Marks';
import { getCharacter } from '../data/characters';
import { bodyTypeLabel } from '../data/workoutLog';
import { useAppInsets } from '../hooks/useAppInsets';
import { useApp } from '../store/AppProvider';
import { colors, font, gradient, layout, radius, space } from '../theme';

const AVATAR = 147;
/** 고양이 헤드만 크롭이 타이트해서 축소 */
const CAT_HEAD_FIT = 0.62;

export function ProfileScreen() {
  const { go, previousTab, characterId, nickname, coins, level, streakDays, survey, logout, openCoinShop } = useApp();
  const { top, navInset } = useAppInsets();
  const character = getCharacter(characterId);
  const headSize = Math.round(AVATAR * (character.id === 'cat' ? CAT_HEAD_FIT : 1));
  const headNudge = Math.round(headSize * (character.nudgeX ?? 0));

  return (
    <View style={styles.root}>
      <SafeAreaView style={[styles.safe, { paddingTop: top }]} edges={[]}>
        <View style={styles.top}>
          <Pressable style={styles.iconBtn} onPress={() => go(previousTab)} hitSlop={12}>
            <BackGlyph />
          </Pressable>
          <AppText variant="heading">프로필</AppText>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: navInset + space[24] }]} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Image
                source={character.head}
                style={{
                  width: headSize,
                  height: headSize,
                  transform: [{ translateX: headNudge }],
                }}
                resizeMode="contain"
              />
            </View>
            <AppText style={styles.name}>{nickname}</AppText>
            <Pressable style={({ pressed }) => [styles.edit, pressed && { opacity: 0.75 }]} onPress={() => go('profileEdit')}>
              <AppText variant="body" style={styles.editText}>
                내 정보 수정
              </AppText>
            </Pressable>
          </View>

          <LinearGradient colors={[...gradient.stats]} start={{ x: 0.05, y: 1 }} end={{ x: 1, y: 0 }} style={styles.stats}>
            <View style={styles.stat}>
              <View style={styles.iconSlot}>
                <Image source={require('../../assets/ui/prize.png')} style={styles.prizeIcon} resizeMode="contain" />
              </View>
              <AppText style={styles.statText} numberOfLines={1}>
                {level}레벨
              </AppText>
            </View>
            <View style={styles.statLine} />
            <View style={styles.stat}>
              <View style={styles.iconSlot}>
                <Image source={require('../../assets/ui/stat-dumbbell.png')} style={styles.dumbbellIcon} resizeMode="contain" />
              </View>
              <AppText style={styles.statText} numberOfLines={1}>
                {streakDays}일 연속
              </AppText>
            </View>
            <View style={styles.statLine} />
            <View style={styles.stat}>
              <View style={styles.iconSlot}>
                <Image source={require('../../assets/ui/body-type.png')} style={styles.bodyIcon} resizeMode="contain" />
              </View>
              <AppText style={styles.statText} numberOfLines={1}>
                {bodyTypeLabel(survey)}
              </AppText>
            </View>
          </LinearGradient>

          <View style={styles.menus}>
            <Pressable onPress={openCoinShop} android_ripple={{ color: 'rgba(25,67,115,0.08)' }} style={styles.menuPress}>
              <MenuCard title="코인" sub="코인 충전하기" extra={`${coins.toLocaleString()}`} coin />
            </Pressable>
            <Pressable onPress={() => go('dex')} android_ripple={{ color: 'rgba(25,67,115,0.08)' }} style={styles.menuPress}>
              <MenuCard title="캐릭터" sub="캐릭터 도감" />
            </Pressable>
            <Pressable onPress={() => go('friends')} android_ripple={{ color: 'rgba(25,67,115,0.08)' }} style={styles.menuPress}>
              <MenuCard title="친구" sub="친구 목록 및 친구 추가" />
            </Pressable>
            <Pressable onPress={() => go('survey')} android_ripple={{ color: 'rgba(25,67,115,0.08)' }} style={styles.menuPress}>
              <MenuCard title="설문조사" sub="맞춤 정보 다시 입력" />
            </Pressable>
            <Pressable onPress={logout} android_ripple={{ color: 'rgba(25,67,115,0.08)' }} style={styles.menuPress}>
              <MenuCard title="로그아웃" sub="다른 계정으로 로그인" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNav active={previousTab === 'home' ? 'home' : previousTab} onChange={go} />
    </View>
  );
}

function MenuCard({ title, sub, extra, coin }: { title: string; sub: string; extra?: string; coin?: boolean }) {
  return (
    <View style={styles.menu}>
      <View>
        <AppText style={styles.menuTitle}>{title}</AppText>
        <AppText style={styles.menuSub}>{sub}</AppText>
      </View>
      <View style={styles.menuRight}>
        {extra ? <AppText style={styles.extra}>{extra}</AppText> : null}
        {coin ? (
          <View style={styles.coinClip}>
            <CoinMark size={19} />
          </View>
        ) : null}
        <AppText style={styles.chevron}>›</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1, paddingHorizontal: layout.header },
  scroll: {},
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 40 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'transparent' },
  identity: { alignItems: 'center', marginTop: space[24] },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  name: {
    textAlign: 'center',
    fontFamily: font.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.45,
    marginTop: 20,
    color: colors.black,
  },
  edit: {
    backgroundColor: colors.sky,
    borderRadius: 34,
    width: 121,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  editText: { color: colors.muted, fontFamily: font.bold, letterSpacing: -0.45 },
  stats: {
    marginTop: layout.cardGap,
    borderRadius: radius.input,
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  stat: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  statLine: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.32)' },
  iconSlot: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  prizeIcon: { width: 24, height: 24, tintColor: colors.white },
  dumbbellIcon: { width: 24, height: 24, tintColor: colors.white },
  bodyIcon: { width: 24, height: 24, tintColor: colors.white },
  statText: { color: colors.white, fontFamily: font.medium, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  menus: { marginTop: space[32], gap: layout.cardGap, paddingBottom: space[8] },
  menuPress: { borderRadius: radius.card, overflow: 'hidden' },
  menu: {
    height: 97,
    backgroundColor: colors.skyCard,
    borderColor: colors.sky,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: space[32],
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  menuTitle: { fontFamily: font.bold, fontSize: 20, lineHeight: 28, color: colors.black },
  menuSub: { color: colors.navy, marginTop: 8, fontFamily: font.medium, fontSize: 16, lineHeight: 20 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  extra: { fontFamily: font.bold, color: '#263129', fontSize: 16, lineHeight: 20 },
  coinClip: { width: 19, height: 19, borderRadius: 10, overflow: 'hidden', backgroundColor: 'transparent' },
  chevron: { fontFamily: font.bold, fontSize: 22, lineHeight: 24, color: '#8B97A3', width: 18, textAlign: 'center' },
});
