import { ImageSourcePropType } from 'react-native';

export type CharacterId =
  | 'otter'
  | 'rabbit'
  | 'cat'
  | 'gorilla'
  | 'dog'
  | 'hamster'
  | 'sloth'
  | 'bear';

export type Character = {
  id: CharacterId;
  name: string;
  nickname: string;
  color: string;
  head: ImageSourcePropType;
  body: ImageSourcePropType;
  ready: ImageSourcePropType;
};

export const CHARACTERS: Character[] = [
  {
    id: 'otter',
    name: '수달',
    nickname: '달이',
    color: '#B3E5FC',
    head: require('../../assets/characters/otter-head.png'),
    body: require('../../assets/characters/otter-body.png'),
    ready: require('../../assets/characters/otter-wave.png'),
  },
  {
    id: 'rabbit',
    name: '토끼',
    nickname: '토리',
    color: '#FFE0B2',
    head: require('../../assets/characters/rabbit-head.png'),
    body: require('../../assets/characters/rabbit-body.png'),
    ready: require('../../assets/characters/ready-rabbit.png'),
  },
  {
    id: 'cat',
    name: '고양이',
    nickname: '냥이',
    color: '#F8BBD0',
    head: require('../../assets/characters/cat-head.png'),
    body: require('../../assets/characters/cat-body.png'),
    ready: require('../../assets/characters/ready-cat.png'),
  },
  {
    id: 'gorilla',
    name: '고릴라',
    nickname: '고릴',
    color: '#CFD8DC',
    head: require('../../assets/characters/gorilla-head.png'),
    body: require('../../assets/characters/gorilla-body.png'),
    ready: require('../../assets/characters/ready-gorilla.png'),
  },
  {
    id: 'dog',
    name: '강아지',
    nickname: '멍이',
    color: '#FFCCBC',
    head: require('../../assets/characters/dog-head.png'),
    body: require('../../assets/characters/dog-body.png'),
    ready: require('../../assets/characters/ready-dog.png'),
  },
  {
    id: 'hamster',
    name: '햄스터',
    nickname: '햄템이',
    color: '#C8E6C9',
    head: require('../../assets/characters/hamster-head.png'),
    body: require('../../assets/characters/hamster-body.png'),
    ready: require('../../assets/characters/ready-hamster.png'),
  },
  {
    id: 'sloth',
    name: '나무늘보',
    nickname: '늘보씨',
    color: '#D1C4E9',
    head: require('../../assets/characters/sloth-head.png'),
    body: require('../../assets/characters/sloth-body.png'),
    ready: require('../../assets/characters/ready-sloth.png'),
  },
  {
    id: 'bear',
    name: '곰',
    nickname: '곰이',
    color: '#FFE082',
    head: require('../../assets/characters/bear-head.png'),
    body: require('../../assets/characters/bear-body.png'),
    ready: require('../../assets/characters/ready-bear.png'),
  },
];

export function getCharacter(id: CharacterId | string) {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

export function asCharacterHead(id: string) {
  return getCharacter(id).head;
}
