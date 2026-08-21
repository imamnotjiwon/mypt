import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { CHARACTERS, CharacterId, getCharacter } from '../data/characters';
import { PrimaryButton } from '../components/PrimaryButton';
import { ShopPurchaseDialog } from '../components/ShopPurchaseDialog';
import { STATUS_BAR_HEIGHT } from '../components/PhoneStatusBar';
import { useApp } from '../store/AppProvider';
import { colors, font, layout, space } from '../theme';

const CHAR_PRICE = 1000;

export function DexScreen() {
  const { go, characterId, setCharacter, ownedItems, buyItem, coins } = useApp();
  const [picked, setPicked] = useState<CharacterId>(characterId);
  const [buyOpen, setBuyOpen] = useState(false);
  const current = getCharacter(picked);
  const owned = ownedItems.includes(picked);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.top}>
        <Pressable onPress={() => go('profile')} style={styles.iconBtn}>
          <Image source={require('../../assets/ui/chevron.png')} style={styles.backIcon} />
        </Pressable>
        <AppText variant="heading">캐릭터</AppText>
        <Pressable onPress={() => go('home')} style={styles.iconBtn}>
          <Image source={require('../../assets/ui/close.png')} style={styles.closeIcon} />
        </Pressable>
      </View>

      <View style={styles.heroBlock}>
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{current.name}</AppText>
        </View>
        <Image source={current.body} style={[styles.hero, !owned && styles.heroLocked]} resizeMode="contain" />
      </View>

      <View style={styles.sheet}>
        <AppText style={styles.section}>캐릭터 도감</AppText>
        <AppText style={styles.hint}>1,000 코인으로 캐릭터를 구매할 수 있어요.</AppText>
        <View style={styles.grid}>
          {CHARACTERS.map((character) => {
            const locked = !ownedItems.includes(character.id);
            return (
              <Pressable
                key={character.id}
                onPress={() => setPicked(character.id)}
                style={[styles.cell, picked === character.id && styles.cellOn]}
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
        <View style={styles.bottom}>
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
    paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : 0,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.header,
    height: 40,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 14, height: 12, transform: [{ rotate: '180deg' }] },
  closeIcon: { width: 22, height: 22 },
  heroBlock: { alignItems: 'center', paddingTop: space[20], paddingBottom: space[8] },
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
  hero: { width: 200, height: 220, marginTop: space[12] },
  heroLocked: { opacity: 0.38 },
  sheet: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: space[8],
    paddingHorizontal: 33,
    paddingTop: space[16],
  },
  section: { fontFamily: font.semiBold, fontSize: 18, lineHeight: 20, color: colors.navy },
  hint: { color: colors.muted, fontFamily: font.regular, fontSize: 12, lineHeight: 20, marginTop: 6, marginBottom: space[16] },
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
  cellOn: { borderColor: colors.navy, borderWidth: 1 },
  cellImg: { width: 64, height: 66 },
  cellImgLocked: { opacity: 0.35 },
  lock: { position: 'absolute', width: 22, height: 22, tintColor: '#5A5A5A' },
  bottom: { marginTop: 'auto', paddingBottom: space[24], paddingHorizontal: 0 },
});
