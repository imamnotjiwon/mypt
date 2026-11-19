import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { CloseGlyph } from './NavGlyph';
import { CoinMark, SearchMark } from './Marks';
import { useAppInsets } from '../hooks/useAppInsets';
import { colors, layout, shadow, space } from '../theme';
import { CharacterId, getCharacter } from '../data/characters';

type Props = {
  nickname: string;
  coins: number;
  characterId: CharacterId;
  onPressProfile: () => void;
  onPressCoins?: () => void;
  onPressSearch?: () => void;
  searchActive?: boolean;
  showCoins?: boolean;
  compact?: boolean;
};

export function ScreenHeader({
  nickname,
  coins,
  characterId,
  onPressProfile,
  onPressCoins,
  onPressSearch,
  searchActive = false,
  showCoins = true,
  compact = false,
}: Props) {
  const character = getCharacter(characterId);
  const { top } = useAppInsets();
  return (
    <View style={[styles.row, { paddingTop: top, paddingBottom: compact ? space[8] : space[16] }]}>
      <Pressable style={styles.profile} onPress={onPressProfile} hitSlop={12}>
        <View style={styles.avatar}>
          <Image source={character.head} style={styles.avatarImg} resizeMode="contain" />
        </View>
        <AppText variant="cardTitle" style={styles.name} numberOfLines={1}>
          {nickname}
        </AppText>
      </Pressable>
      {onPressSearch ? (
        <Pressable style={styles.search} onPress={onPressSearch} hitSlop={12}>
          {searchActive ? <CloseGlyph /> : <SearchMark size={20} />}
        </Pressable>
      ) : showCoins ? (
        <Pressable style={styles.coin} onPress={onPressCoins} hitSlop={12} disabled={!onPressCoins}>
          <CoinMark size={16} />
          <AppText variant="caption" style={styles.coinText}>
            {coins.toLocaleString()}
          </AppText>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.header,
    paddingBottom: space[16],
    minHeight: 48,
    zIndex: 2,
  },
  profile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
    paddingRight: space[12],
    minHeight: 44,
  },
  avatar: {
    width: layout.avatar,
    height: layout.avatar,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  name: {
    flexShrink: 1,
    color: colors.text,
  },
  coin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    minHeight: 40,
    paddingHorizontal: space[12],
    paddingVertical: space[8],
    gap: 8,
    ...shadow.soft,
  },
  coinText: {
    fontFamily: 'Pretendard-Bold',
    color: '#263129',
  },
  search: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
});
