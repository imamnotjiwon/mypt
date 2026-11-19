import { ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { CharacterId, getCharacter } from '../data/characters';
import { useAppInsets } from '../hooks/useAppInsets';
import { useDesignScale } from '../hooks/useDesignScale';
import { FloorShadow } from './FloorShadow';
import { colors } from '../theme';

const HERO = require('../../assets/ui/home-hero.png');
const DROP = 20;
const CHAR_W = 148;
const CHAR_H = 198;

type Props = {
  characterSource: ImageSourcePropType;
  characterId: CharacterId;
  header: ReactNode;
};

export function CharacterHero({ characterSource, characterId, header }: Props) {
  const { top } = useAppInsets();
  const s = useDesignScale();
  const character = getCharacter(characterId);
  const scale = character.bodyScale;
  const charW = Math.round(CHAR_W * scale * s);
  const charH = Math.round(CHAR_H * scale * s);
  const nudge = Math.round(charW * (character.nudgeX ?? 0));

  return (
    <View style={[styles.section, { height: Math.round(244 * s) + top + DROP }]}>
      <View style={styles.bgClip} pointerEvents="none">
        <Image source={HERO} style={styles.bg} resizeMode="cover" />
        <Image source={HERO} style={[styles.bg, { top: DROP }]} resizeMode="cover" />
      </View>
      <View style={[styles.stage, { top }]} pointerEvents="none">
        <Image
          source={characterSource}
          style={{
            width: charW,
            height: charH,
            zIndex: 2,
            transform: [{ translateX: nudge }],
          }}
          resizeMode="contain"
        />
        <FloorShadow
          width={Math.round(charW * 0.62)}
          height={Math.round(charW * 0.12)}
          style={[styles.shadow, { transform: [{ translateX: nudge }] }]}
        />
      </View>
      <View style={styles.header}>{header}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    position: 'relative',
    overflow: 'visible',
    backgroundColor: colors.sky,
  },
  bgClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bg: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  stage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
});
