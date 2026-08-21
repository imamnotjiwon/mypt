import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { CoinMark } from './Marks';
import { STATUS_BAR_HEIGHT } from './PhoneStatusBar';
import { colors, layout, shadow, space } from '../theme';
import { CharacterId, getCharacter } from '../data/characters';

type Props = {
  nickname: string;
  coins: number;
  characterId: CharacterId;
  onPressProfile: () => void;
  showCoins?: boolean;
};

export function ScreenHeader({ nickname, coins, characterId, onPressProfile, showCoins = true }: Props) {
  const character = getCharacter(characterId);
  return (
    <View style={styles.row}>
      <Pressable style={styles.profile} onPress={onPressProfile} hitSlop={8}>
        <View style={styles.avatar}>
          <Image source={character.head} style={styles.avatarImg} resizeMode="contain" />
        </View>
        <AppText variant="cardTitle" style={styles.name}>
          {nickname}
        </AppText>
      </Pressable>
      {showCoins ? (
        <View style={styles.coin}>
          <CoinMark size={16} />
          <AppText variant="caption" style={styles.coinText}>
            {coins.toLocaleString()}
          </AppText>
        </View>
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
    paddingTop: Platform.OS === 'web' ? STATUS_BAR_HEIGHT : space[8],
    paddingBottom: space[16],
    minHeight: 48,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[12],
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
    color: colors.text,
  },
  coin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: space[12],
    paddingVertical: space[6],
    gap: 8,
    ...shadow.soft,
  },
  coinText: {
    fontFamily: 'Pretendard-Bold',
    color: '#263129',
  },
});
