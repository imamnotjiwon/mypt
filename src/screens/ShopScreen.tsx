import { useMemo, useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BottomNav } from '../components/BottomNav';
import { CoinMark } from '../components/Marks';
import { ScreenHeader } from '../components/ScreenHeader';
import { ShopPurchaseDialog } from '../components/ShopPurchaseDialog';
import { getCharacter } from '../data/characters';
import { useApp } from '../store/AppProvider';
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
  const { go, nickname, coins, characterId, ownedItems, buyItem } = useApp();
  const character = getCharacter(characterId);
  const [equipped, setEquipped] = useState('jacket');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('전체');
  const [menuOpen, setMenuOpen] = useState(false);
  const wearingJacket = characterId === 'otter' && equipped === 'jacket';
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
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Image source={require('../../assets/ui/home-hero.png')} style={styles.heroBg} resizeMode="cover" />
            <ScreenHeader
              nickname={nickname}
              coins={coins}
              characterId={characterId}
              onPressProfile={() => go('profile')}
              showCoins={false}
            />
            <Image
              source={wearingJacket ? require('../../assets/shop/otter-jacket.png') : character.body}
              style={styles.hero}
              resizeMode="contain"
            />
            <View style={styles.heroMeta}>
              <Pressable style={styles.filter} onPress={() => setMenuOpen((open) => !open)}>
                <AppText variant="caption" style={styles.filterText}>
                  {category === '전체' ? '의상' : category}
                </AppText>
                <AppText style={styles.chevron}>{menuOpen ? '▴' : '▾'}</AppText>
              </Pressable>
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
            </View>
          </View>

          <View style={styles.grid}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.cell}
                onPress={() => {
                  if (item.owned) {
                    setEquipped(item.id);
                    return;
                  }
                  setPendingId(item.id);
                }}
              >
                {item.isNew ? <Image source={require('../../assets/shop/new.png')} style={styles.newBadge} /> : null}
                <View style={styles.thumb}>
                  <Image source={item.image} style={styles.thumbImg} resizeMode="contain" />
                </View>
                {item.owned ? (
                  <AppText variant="caption" style={styles.owned}>
                    보유중
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
          onBuy={() => {
            if (buyItem(pending.id, pending.price)) setEquipped(pending.id);
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
  scroll: { paddingBottom: layout.navInset },
  heroSection: { height: 355, overflow: 'visible' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 355 },
  hero: { width: 168, height: 210, alignSelf: 'center' },
  heroMeta: {
    position: 'absolute',
    left: layout.screen,
    bottom: 16,
    zIndex: 6,
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sky,
    borderWidth: 1,
    borderColor: '#D9ECFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    minWidth: 88,
    justifyContent: 'center',
  },
  filterText: { fontFamily: font.bold, color: '#263129' },
  chevron: { color: colors.navy, fontSize: 10 },
  menu: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9ECFF',
    overflow: 'hidden',
    minWidth: 128,
    ...shadow.soft,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
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
  },
  thumbImg: { width: 84, height: 84 },
  owned: { fontFamily: font.bold, color: '#263129', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontFamily: font.bold, color: '#263129' },
});
