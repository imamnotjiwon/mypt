import { useMemo, useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { CharacterHero } from '../components/CharacterHero';
import { CoinMark } from '../components/Marks';
import { ScreenHeader } from '../components/ScreenHeader';
import { ShopPurchaseDialog } from '../components/ShopPurchaseDialog';
import { getCharacter } from '../data/characters';
import { heroBodySource } from '../data/outfit';
import { useApp } from '../store/AppProvider';
import { useAppInsets } from '../hooks/useAppInsets';
import { useDesignScale } from '../hooks/useDesignScale';
import { colors, font, layout, shadow, space } from '../theme';

type Category = '전체' | '상의' | '바지' | '겉옷' | '모자' | '악세서리';

type Item = {
  id: string;
  price: number;
  isNew?: boolean;
  image: ImageSourcePropType;
  category: Exclude<Category, '전체'>;
};

const CATEGORIES: Category[] = ['전체', '상의', '바지', '겉옷', '모자', '악세서리'];

const CATALOG: Item[] = [
  { id: 'jacket', price: 0, image: require('../../assets/shop/jacket.png'), category: '겉옷' },
  { id: 'tee', price: 4500, image: require('../../assets/shop/tee.png'), category: '상의' },
  { id: 'vest', price: 5500, isNew: true, image: require('../../assets/shop/vest.png'), category: '겉옷' },
  { id: 'shorts-grey', price: 1500, image: require('../../assets/shop/shorts2.png'), category: '바지' },
  { id: 'shorts-black', price: 1000, image: require('../../assets/shop/shorts.png'), category: '바지' },
  { id: 'hoodie', price: 2000, isNew: true, image: require('../../assets/shop/hoodie.png'), category: '겉옷' },
  { id: 'shorts-navy', price: 1500, image: require('../../assets/shop/item-b.png'), category: '바지' },
  { id: 'tee-blue', price: 1000, image: require('../../assets/shop/tee-blue.png'), category: '상의' },
  { id: 'tank', price: 2000, image: require('../../assets/shop/tank.png'), category: '상의' },
  { id: 'cap', price: 2500, image: require('../../assets/shop/item-a.png'), category: '모자' },
  { id: 'beanie', price: 1800, isNew: true, image: require('../../assets/shop/item-a.png'), category: '모자' },
  { id: 'band', price: 1200, image: require('../../assets/shop/item-c.png'), category: '악세서리' },
  { id: 'watch', price: 3200, image: require('../../assets/shop/item-c.png'), category: '악세서리' },
];

export function ShopScreen() {
  const { go, nickname, coins, characterId, ownedItems, buyItem, equipItem, equippedItem, openCoinShop } = useApp();
  const { navInset } = useAppInsets();
  const s = useDesignScale();
  const thumb = Math.round(96 * s);
  const thumbImg = Math.round(84 * s);
  const character = getCharacter(characterId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('전체');
  const [menuOpen, setMenuOpen] = useState(false);
  const pending = CATALOG.find((item) => item.id === pendingId) ?? null;
  const items = useMemo(
    () =>
      CATALOG.filter((item) => category === '전체' || item.category === category).map((item) => ({
        ...item,
        owned: ownedItems.includes(item.id),
      })),
    [category, ownedItems],
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={[]}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: navInset }]} showsVerticalScrollIndicator={false}>
          <CharacterHero
            characterSource={heroBodySource(characterId, equippedItem)}
            characterId={characterId}
            header={
              <ScreenHeader
                nickname={nickname}
                coins={coins}
                characterId={characterId}
                onPressProfile={() => go('profile')}
                onPressCoins={openCoinShop}
              />
            }
          />

          <View style={styles.toolbar}>
            <Pressable style={styles.filter} onPress={() => setMenuOpen((open) => !open)} hitSlop={8}>
              <AppText variant="caption" style={styles.filterText}>
                {category}
              </AppText>
              <Image
                source={require('../../assets/ui/icon-dropdown.png')}
                style={[styles.dropIcon, menuOpen && styles.dropIconOpen]}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          <View style={styles.gridSection}>
            {menuOpen ? (
              <View style={styles.menu}>
                {CATEGORIES.map((item) => (
                  <Pressable
                    key={item}
                    style={[styles.menuItem, category === item && styles.menuItemOn]}
                    onPress={() => {
                      setCategory(item);
                      setMenuOpen(false);
                    }}
                  >
                    <AppText style={[styles.menuTxt, category === item && styles.menuTxtOn]}>{item}</AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View style={styles.grid}>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.cell, pressed && { opacity: 0.72 }]}
                  onPress={() => {
                    if (item.owned) {
                      equipItem(item.id);
                      return;
                    }
                    setPendingId(item.id);
                  }}
                >
                  {item.isNew ? <Image source={require('../../assets/shop/new.png')} style={styles.newBadge} /> : null}
                  <View style={[styles.thumb, { width: thumb, height: thumb }, equippedItem === item.id && styles.thumbOn]}>
                    <Image source={item.image} style={{ width: thumbImg, height: thumbImg }} resizeMode="contain" />
                  </View>
                  {item.owned ? (
                    <AppText variant="caption" style={[styles.owned, equippedItem === item.id && styles.equipped]}>
                      {equippedItem === item.id ? '착용중' : '보유중'}
                    </AppText>
                  ) : (
                    <View style={styles.priceRow}>
                      <CoinMark size={16} />
                      <AppText variant="caption" style={styles.price}>
                        {item.price}
                      </AppText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {pending ? (
        <ShopPurchaseDialog
          character={character.head}
          canAfford={coins >= pending.price}
          price={pending.price}
          onClose={() => setPendingId(null)}
          onMission={() => {
            setPendingId(null);
            go('home');
          }}
          onCharge={() => {
            setPendingId(null);
            openCoinShop();
          }}
          onBuy={() => {
            if (buyItem(pending.id, pending.price)) equipItem(pending.id);
            setPendingId(null);
          }}
        />
      ) : null}
      <BottomNav active="shop" onChange={go} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: {},
  toolbar: {
    alignItems: 'flex-end',
    paddingHorizontal: layout.screen,
    marginTop: -36,
    paddingTop: 0,
    paddingBottom: space[8],
    zIndex: 8,
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sky,
    borderWidth: 1,
    borderColor: '#D9ECFF',
    borderRadius: 999,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  filterText: { fontFamily: font.bold, color: '#263129' },
  dropIcon: { width: 14, height: 9 },
  dropIconOpen: { transform: [{ rotate: '180deg' }] },
  gridSection: { position: 'relative', zIndex: 7 },
  menu: {
    position: 'absolute',
    top: 0,
    right: layout.screen,
    zIndex: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9ECFF',
    overflow: 'hidden',
    minWidth: 128,
    ...shadow.soft,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 14, minHeight: 44, justifyContent: 'center' },
  menuItemOn: { backgroundColor: colors.sky },
  menuTxt: { fontFamily: font.medium, fontSize: 14, color: colors.text },
  menuTxtOn: { fontFamily: font.bold, color: colors.navy },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 32,
    paddingTop: space[8],
  },
  cell: {
    width: '33.33%',
    alignItems: 'center',
    paddingBottom: space[20],
    position: 'relative',
  },
  newBadge: { position: 'absolute', top: -4, right: 8, width: 25, height: 25, zIndex: 2 },
  thumb: {
    width: 96,
    height: 96,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.skyCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbOn: { borderColor: colors.navy, backgroundColor: '#EAF4FF' },
  thumbImg: { width: 84, height: 84 },
  owned: { fontFamily: font.bold, color: '#263129', marginTop: 4 },
  equipped: { color: colors.navy },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontFamily: font.bold, color: '#263129' },
});
