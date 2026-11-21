import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { CHARACTERS, CharacterId, getCharacter } from '../data/characters';
import { PrimaryButton } from '../components/PrimaryButton';
import { BackGlyph, CloseGlyph } from '../components/NavGlyph';
import { ShopPurchaseDialog } from '../components/ShopPurchaseDialog';
import { useAppInsets } from '../hooks/useAppInsets';
import { useApp } from '../store/AppProvider';
import { colors, font, layout, space } from '../theme';

const CHAR_PRICE = 1000;
/** 로그인 마퀴 타일(~frame/2)에 가까운 비율 */
const HERO_W = 148;
const HERO_H = 184;
const CELL_IMG = 44;

export function DexScreen() {
  const { go, characterId, setCharacter, ownedItems, buyItem, coins, openCoinShop } = useApp();
  const { top, bottom } = useAppInsets();
  const [picked, setPicked] = useState<CharacterId>(characterId);
  const [buyOpen, setBuyOpen] = useState(false);
  const current = getCharacter(picked);
  const owned = ownedItems.includes(picked);

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: top, paddingBottom: bottom }]} edges={[]}>
      <View style={styles.top}>
        <Pressable onPress={() => go('profile')} style={styles.iconBtn} hitSlop={12}>
          <BackGlyph />
        </Pressable>
        <AppText variant="heading">캐릭터</AppText>
        <Pressable onPress={() => go('home')} style={styles.iconBtn} hitSlop={12}>
          <CloseGlyph />
        </Pressable>
      </View>

      <View style={styles.heroBlock}>
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{current.name}</AppText>
        </View>
        <View style={styles.heroStage}>
          <Image
            source={current.body}
            style={[styles.hero, !owned && styles.heroLocked]}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.sheet}>
        <AppText style={styles.section}>캐릭터 도감</AppText>
        <AppText style={styles.hint}>1,000 코인으로 캐릭터를 구매할 수 있어요.</AppText>
        <View style={styles.grid}>
          {CHARACTERS.map((character) => {
            const locked = !ownedItems.includes(character.id);
            const selected = picked === character.id;
            return (
              <Pressable
                key={character.id}
                onPress={() => setPicked(character.id)}
                style={[styles.cell, selected && styles.cellOn]}
              >
                <Image
                  source={character.head}
                  style={[styles.cellImg, locked && styles.cellImgLocked]}
                  resizeMode="contain"
                />
                {locked ? (
                  <Image source={require('../../assets/ui/lock.png')} style={styles.lock} resizeMode="contain" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.cta}>
          {owned ? (
            <PrimaryButton
              label="내 캐릭터 바꾸기"
              onPress={() => {
                setCharacter(picked);
                go('home');
              }}
            />
          ) : (
            <PrimaryButton label="1,000 코인으로 구매" onPress={() => setBuyOpen(true)} />
          )}
        </View>
      </View>
      {buyOpen ? (
        <ShopPurchaseDialog
          character={current.head}
          canAfford={coins >= CHAR_PRICE}
          price={CHAR_PRICE}
          itemLabel="캐릭터"
          onClose={() => setBuyOpen(false)}
          onMission={() => {
            setBuyOpen(false);
            go('home');
          }}
          onCharge={() => {
            setBuyOpen(false);
            openCoinShop();
          }}
          onBuy={() => {
            if (buyItem(picked, CHAR_PRICE)) {
              setCharacter(picked);
              setBuyOpen(false);
            }
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.header,
    height: 40,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  heroBlock: { alignItems: 'center', paddingTop: space[12], paddingBottom: space[4] },
  badge: {
    backgroundColor: colors.sky,
    borderRadius: 34,
    width: 121,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.45,
    color: colors.muted,
  },
  heroStage: {
    width: HERO_W,
    height: HERO_H,
    marginTop: space[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: HERO_W,
    height: HERO_H,
  },
  heroLocked: { opacity: 0.38 },
  sheet: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: space[8],
    paddingHorizontal: 33,
    paddingTop: space[16],
  },
  section: { fontFamily: font.semiBold, fontSize: 18, lineHeight: 20, color: colors.navy },
  hint: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: space[16],
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 26 },
  cell: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cellOn: { borderColor: colors.navy, borderWidth: 2 },
  cellImg: { width: CELL_IMG, height: CELL_IMG },
  cellImgLocked: { opacity: 0.35 },
  lock: { position: 'absolute', width: 22, height: 22, tintColor: '#5A5A5A' },
  cta: { marginTop: 'auto', paddingBottom: space[12], paddingHorizontal: 0 },
});
