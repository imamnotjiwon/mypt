import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { CoinMark } from '../components/Marks';
import { BackGlyph } from '../components/NavGlyph';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAppInsets } from '../hooks/useAppInsets';
import { useApp } from '../store/AppProvider';
import { colors, font, gradient, layout, radius, shadow, space } from '../theme';

type Pack = {
  id: string;
  coins: number;
  bonus: number;
  price: string;
  tag?: string;
};

const PACKS: Pack[] = [
  { id: 'starter', coins: 1200, bonus: 0, price: '₩1,200' },
  { id: 'plus', coins: 6500, bonus: 500, price: '₩5,900', tag: '인기' },
  { id: 'max', coins: 15000, bonus: 2500, price: '₩12,000', tag: '혜택' },
  { id: 'mega', coins: 40000, bonus: 8000, price: '₩29,000', tag: 'VIP' },
];

export function CoinShopScreen() {
  const { closeCoinShop, coins, addCoins } = useApp();
  const { top, bottom } = useAppInsets();
  const [pack, setPack] = useState<Pack | null>(null);
  const [method, setMethod] = useState<'kakao' | 'card'>('kakao');
  const [phase, setPhase] = useState<'pick' | 'pay' | 'done'>('pick');

  const total = pack ? pack.coins + pack.bonus : 0;

  const pay = () => {
    if (!pack || phase !== 'pay') return;
    setPhase('done');
    setTimeout(() => {
      addCoins(total);
    }, 80);
  };

  const closeSheet = () => {
    setPack(null);
    setPhase('pick');
    setMethod('kakao');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={[styles.safe, { paddingTop: top, paddingBottom: bottom }]} edges={[]}>
        <View style={styles.top}>
          <Pressable style={styles.iconBtn} onPress={closeCoinShop} hitSlop={12}>
            <BackGlyph />
          </Pressable>
          <AppText variant="heading">코인 충전</AppText>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={[...gradient.stats]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.balance}>
            <AppText style={styles.balanceLabel}>보유 코인</AppText>
            <View style={styles.balanceRow}>
              <CoinMark size={28} />
              <AppText style={styles.balanceNum}>{coins.toLocaleString()}</AppText>
            </View>
          </LinearGradient>

          <AppText style={styles.lead}>원하는 상품을 고르면 바로 충전돼요.</AppText>

          {PACKS.map((item) => {
            const amount = item.coins + item.bonus;
            return (
              <Pressable key={item.id} style={styles.pack} onPress={() => { setPack(item); setPhase('pay'); }}>
                {item.tag ? (
                  <View style={styles.tag}>
                    <AppText style={styles.tagTxt}>{item.tag}</AppText>
                  </View>
                ) : null}
                <View style={styles.packLeft}>
                  <CoinMark size={22} />
                  <View>
                    <AppText style={styles.packCoins}>{amount.toLocaleString()} 코인</AppText>
                    {item.bonus > 0 ? (
                      <AppText style={styles.packBonus}>+{item.bonus.toLocaleString()} 보너스</AppText>
                    ) : (
                      <AppText style={styles.packBonus}>{item.coins.toLocaleString()} 충전</AppText>
                    )}
                  </View>
                </View>
                <View style={styles.priceBtn}>
                  <AppText style={styles.priceTxt}>{item.price}</AppText>
                </View>
              </Pressable>
            );
          })}

          <AppText style={styles.note}>데모 결제예요. 실제로 돈이 나가지는 않아요.</AppText>
        </ScrollView>
      </SafeAreaView>

      {pack && phase !== 'pick' ? (
        <View style={styles.dim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={phase === 'pay' ? closeSheet : undefined} />
          <View style={styles.sheet}>
            {phase === 'pay' ? (
              <>
                <AppText style={styles.sheetTitle}>결제하기</AppText>
                <AppText style={styles.sheetSub}>
                  {total.toLocaleString()}코인 · {pack.price}
                </AppText>
                <Pressable style={[styles.method, method === 'kakao' && styles.methodOn]} onPress={() => setMethod('kakao')}>
                  <AppText style={[styles.methodTxt, method === 'kakao' && styles.methodTxtOn]}>카카오페이</AppText>
                </Pressable>
                <Pressable style={[styles.method, method === 'card' && styles.methodOn]} onPress={() => setMethod('card')}>
                  <AppText style={[styles.methodTxt, method === 'card' && styles.methodTxtOn]}>신용/체크카드</AppText>
                </Pressable>
                <View style={{ marginTop: space[8] }}>
                  <PrimaryButton label={`${pack.price} 결제`} onPress={pay} />
                </View>
                <Pressable style={styles.cancel} onPress={closeSheet}>
                  <AppText style={styles.cancelTxt}>취소</AppText>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.check}>
                  <AppText style={styles.checkMark}>✓</AppText>
                </View>
                <AppText style={styles.sheetTitle}>충전 완료</AppText>
                <AppText style={styles.sheetSub}>{total.toLocaleString()}코인이 들어왔어요.</AppText>
                <View style={{ marginTop: space[8] }}>
                  <PrimaryButton label="확인" onPress={closeSheet} />
                </View>
              </>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  top: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screen,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: layout.screen, paddingTop: space[16], paddingBottom: layout.navInset, gap: space[12] },
  balance: { borderRadius: radius.input, padding: space[20] },
  balanceLabel: { color: colors.white, fontFamily: font.medium, opacity: 0.9 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  balanceNum: { color: colors.white, fontFamily: font.extraBold, fontSize: 32, lineHeight: 40 },
  lead: { fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: space[4] },
  pack: {
    backgroundColor: colors.skyCard,
    borderWidth: 1,
    borderColor: colors.sky,
    borderRadius: radius.card,
    paddingHorizontal: space[16],
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  tag: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.navy,
    borderBottomRightRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagTxt: { color: colors.white, fontFamily: font.bold, fontSize: 11, lineHeight: 14 },
  packLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  packCoins: { fontFamily: font.bold, fontSize: 18, lineHeight: 24, color: colors.black },
  packBonus: { fontFamily: font.medium, fontSize: 12, lineHeight: 16, color: colors.navy, marginTop: 2 },
  priceBtn: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadow.soft,
  },
  priceTxt: { fontFamily: font.bold, color: colors.navy, fontSize: 14, lineHeight: 18 },
  note: { textAlign: 'center', color: colors.gray, fontFamily: font.medium, fontSize: 12, lineHeight: 18, marginTop: space[8] },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 32, 56, 0.38)',
    justifyContent: 'flex-end',
    zIndex: 40,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: layout.screen,
    paddingBottom: space[32],
    gap: space[10],
  },
  sheetTitle: { fontFamily: font.extraBold, fontSize: 22, lineHeight: 28, color: colors.navyInk, textAlign: 'center' },
  sheetSub: { fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center', marginBottom: space[8] },
  method: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8EEF3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  methodOn: { borderColor: colors.navy, backgroundColor: colors.sky },
  methodTxt: { fontFamily: font.bold, color: colors.muted },
  methodTxtOn: { color: colors.navy },
  cancel: { alignItems: 'center', paddingVertical: space[8] },
  cancelTxt: { fontFamily: font.bold, color: colors.navy },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  checkMark: { color: colors.white, fontFamily: font.extraBold, fontSize: 28, lineHeight: 32 },
});
