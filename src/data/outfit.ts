import { ImageSourcePropType } from 'react-native';
import { CharacterId, getCharacter } from './characters';

const OUTFITS: Record<string, ImageSourcePropType> = {
  'otter:jacket': require('../../assets/shop/otter-jacket.png'),
};

export function heroBodySource(characterId: CharacterId, equippedItem: string): ImageSourcePropType {
  return OUTFITS[`${characterId}:${equippedItem}`] ?? getCharacter(characterId).body;
}
