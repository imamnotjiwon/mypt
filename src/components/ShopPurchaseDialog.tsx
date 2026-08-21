import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { colors, font, gradient, shadow, space } from '../theme';

type Props = {
  character: ImageSourcePropType;
  canAfford: boolean;
  price: number;
  itemLabel?: string;
  onClose: () => void;
  onMission: () => void;
  onBuy: () => void;
};

export function ShopPurchaseDialog({ character, canAfford, price, itemLabel = '의상', onClose, onMission, onBuy }: Props) {
  return (
    <View style={styles.dim}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <Image source={character} style={styles.avatar} resizeMode="contain" />
        </View>
        {canAfford ? (
          <>
            <AppText style={styles.title}>구매를 하실건가요?</AppText>
            <AppText style={styles.sub}>코인 {price.toLocaleString()}을 사용해 {itemLabel}를 구매해요.</AppText>
            <View style={styles.actions}>
              <Pressable style={styles.primaryWrap} onPress={onBuy}>
                <LinearGradient colors={[...gradient.button]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.primary}>
                  <AppText style={styles.primaryTxt}>구매하기</AppText>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.secondary} onPress={onClose}>
                <AppText style={styles.secondaryTxt}>취소</AppText>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <AppText style={styles.title}>코인이 부족합니다!</AppText>
            <AppText style={styles.sub}>원하는 {itemLabel}를 구매하려면 코인을 더 모아야해요.</AppText>
            <View style={styles.actions}>
              <Pressable style={styles.primaryWrap} onPress={onMission}>
                <LinearGradient colors={[...gradient.button]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.primary}>
                  <AppText style={styles.primaryTxt}>미션 깨기</AppText>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.secondary} onPress={onClose}>
                <AppText style={styles.secondaryTxt}>다음에</AppText>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 32, 56, 0.38)',
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    ...shadow.card,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: colors.skyCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[16],
  },
  avatar: { width: 80, height: 80 },
  title: {
    fontFamily: font.extraBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.navyInk,
    textAlign: 'center',
  },
  sub: {
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: space[20],
  },
  primaryWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primary: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTxt: {
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.white,
  },
  secondary: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D7E4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTxt: {
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
});
