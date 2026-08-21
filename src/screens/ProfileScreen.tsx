import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { CoinMark } from '../components/Marks';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { getCharacter } from '../data/characters';
import { useApp } from '../store/AppProvider';
import { colors, font, gradient, layout, radius, space } from '../theme';

export function ProfileScreen() {
  const { go, previousTab, characterId, nickname, coins, level, streakDays, logout } = useApp();
  const character = getCharacter(characterId);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Pressable style={styles.iconBtn} onPress={() => go(previousTab)}>
            <Image source={require('../../assets/ui/chevron.png')} style={styles.backIcon} />
          </Pressable>
          <AppText variant="heading">프로필</AppText>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Image source={character.head} style={styles.avatarImg} resizeMode="contain" />
            </View>
            <AppText style={styles.name}>{nickname}</AppText>
            <View style={styles.edit}>
              <AppText variant="body" style={styles.editText}>
                내 정보 수정
              </AppText>
            </View>
          </View>

          <LinearGradient colors={[...gradient.stats]} start={{ x: 0.05, y: 1 }} end={{ x: 1, y: 0 }} style={styles.stats}>
            <View style={styles.stat}>
              <View style={styles.iconSlot}>
                <Image source={require('../../assets/ui/prize.png')} style={styles.prizeIcon} resizeMode="contain" />
              </View>
              <AppText style={styles.statText}>{level}레벨</AppText>
            </View>
            <View style={styles.statLine} />
            <View style={styles.stat}>
              <View style={styles.iconSlot}>
                <Image source={require('../../assets/ui/stat-dumbbell.png')} style={styles.dumbbellIcon} resizeMode="contain" />
              </View>
              <AppText style={styles.statText}>{streakDays}일째</AppText>
            </View>
            <View style={styles.statLine} />
            <View style={styles.stat}>
              <View style={styles.iconSlot}>
                <Image source={require('../../assets/ui/body-type.png')} style={styles.bodyIcon} resizeMode="contain" />
              </View>
              <AppText style={styles.statText}>표준체형</AppText>
            </View>
          </LinearGradient>

          <View style={styles.menus}>
            <MenuCard title="코인" sub="나의 코인" extra={`${coins.toLocaleString()}`} coin />
            <Pressable onPress={() => go('dex')}>
              <MenuCard title="캐릭터" sub="캐릭터 도감" />
            </Pressable>
            <Pressable onPress={() => go('friends')}>
              <MenuCard title="친구" sub="친구 목록 및 친구 추가" />
            </Pressable>
            <Pressable onPress={() => go('survey')}>
              <MenuCard title="설문조사" sub="맞춤 정보 다시 입력" />
            </Pressable>
            <Pressable onPress={logout}>
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
        {coin ? <CoinMark size={19} /> : null}
        <Image source={require('../../assets/ui/chevron.png')} style={styles.chevron} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1, paddingHorizontal: layout.header, paddingBottom: layout.navInset, paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 0 },
  scroll: { paddingBottom: space[24] },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 40 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 14, height: 12, transform: [{ rotate: '180deg' }] },
  identity: { alignItems: 'center', marginTop: space[24] },
  avatar: {
    width: 147,
    height: 147,
    borderRadius: 74,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  avatarImg: { width: 147, height: 147 },
  name: {
    textAlign: 'center',
    fontFamily: font.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.45,
    marginTop: 19,
    color: colors.black,
  },
  edit: {
    backgroundColor: colors.sky,
    borderRadius: 34,
    width: 121,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  editText: { color: colors.muted, fontFamily: font.bold, letterSpacing: -0.45 },
  stats: {
    marginTop: layout.cardGap,
    borderRadius: radius.input,
    height: 86,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 28,
  },
  stat: { width: 86, alignItems: 'center', gap: 6 },
  statLine: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.32)' },
  iconSlot: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  prizeIcon: { width: 26, height: 26, tintColor: colors.white },
  dumbbellIcon: { width: 22, height: 22, tintColor: colors.white },
  bodyIcon: { width: 32, height: 32, tintColor: colors.white, transform: [{ translateY: -4 }] },
  statText: { color: colors.white, fontFamily: font.medium, fontSize: 14, lineHeight: 23 },
  menus: { marginTop: space[32], gap: layout.cardGap, paddingBottom: space[16] },
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
  },
  menuTitle: { fontFamily: font.bold, fontSize: 20, lineHeight: 28, color: colors.black },
  menuSub: { color: colors.navy, marginTop: 8, fontFamily: font.medium, fontSize: 16, lineHeight: 20 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  extra: { fontFamily: font.bold, color: '#263129', fontSize: 16, lineHeight: 20 },
  chevron: { width: 22, height: 22, transform: [{ rotate: '180deg' }], tintColor: '#8B97A3' },
});
