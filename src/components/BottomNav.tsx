import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { colors, font, gradient, layout, shadow } from '../theme';
import { ScreenName } from '../store/AppProvider';

const TABS: {
  key: ScreenName;
  label: string;
  off: ImageSourcePropType;
  on: ImageSourcePropType;
  width: number;
  height: number;
}[] = [
  {
    key: 'quest',
    label: '퀘스트',
    off: require('../../assets/ui/nav/quest-off.png'),
    on: require('../../assets/ui/nav/quest-on.png'),
    width: 18,
    height: 26,
  },
  {
    key: 'exercise',
    label: '운동 기록',
    off: require('../../assets/ui/nav/exercise-off.png'),
    on: require('../../assets/ui/nav/exercise-on.png'),
    width: 28,
    height: 22,
  },
  {
    key: 'home',
    label: '홈',
    off: require('../../assets/ui/nav/home-off.png'),
    on: require('../../assets/ui/nav/home-on.png'),
    width: 26,
    height: 26,
  },
  {
    key: 'shop',
    label: '상점',
    off: require('../../assets/ui/nav/shop-off.png'),
    on: require('../../assets/ui/nav/shop-on.png'),
    width: 26,
    height: 22,
  },
  {
    key: 'community',
    label: '커뮤니티',
    off: require('../../assets/ui/nav/community-off.png'),
    on: require('../../assets/ui/nav/community-on.png'),
    width: 28,
    height: 26,
  },
];

type Props = {
  active: ScreenName;
  onChange: (screen: ScreenName) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const selected = tab.key === active;
          const icon = (
            <Image
              source={selected ? tab.on : tab.off}
              style={{ width: tab.width, height: tab.height }}
              resizeMode="contain"
            />
          );
          const inner = (
            <>
              <View style={styles.iconSlot}>{icon}</View>
              <AppText variant="nav" style={selected ? styles.activeLabel : styles.label}>
                {tab.label}
              </AppText>
            </>
          );
          return (
            <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={styles.item}>
              {selected ? (
                <LinearGradient colors={[...gradient.nav]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.tabInner}>
                  {inner}
                </LinearGradient>
              ) : (
                <View style={styles.tabInner}>{inner}</View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: layout.navHeight,
  },
  bar: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    ...shadow.nav,
  },
  item: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    width: 70,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconSlot: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.navy,
    fontFamily: font.semiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  activeLabel: {
    color: colors.white,
    fontFamily: font.semiBold,
    fontSize: 11,
    lineHeight: 14,
  },
});
