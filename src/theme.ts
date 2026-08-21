import { type TextStyle } from 'react-native';

export const colors = {
  navy: '#194373',
  navyDeep: '#0C4874',
  navyInk: '#002C57',
  teal: '#33A1C3',
  tealSoft: '#68BFD9',
  sky: '#E5F1FD',
  skyCard: '#F2F9FF',
  skyTop: '#C4DFFC',
  white: '#FFFFFF',
  black: '#000000',
  text: '#2C2F31',
  muted: '#5A5A5A',
  gray: '#929292',
  line: '#F1F5F9',
  kakao: '#FFEA40',
  appleBtn: '#F6F6F8',
  progressTrack: '#DDEEF5',
  bronze: '#E8A87C',
  gold: '#E8B923',
  body: '#43474F',
};

export const gradient = {
  button: ['#33A1C3', '#0C4874'] as const,
  nav: ['#53B6D3', '#0C4874'] as const,
  avatar: ['#6EC7DF', '#053F6C'] as const,
  stats: ['#72CCE3', '#194373'] as const,
};

/** Figma 402 프레임 기준. 화면 여백은 24, 헤더는 30, 로그인은 58. */
export const space = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  13: 13,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  30: 30,
  32: 32,
};

export const layout = {
  phone: 402,
  screen: 24,
  header: 30,
  loginActions: 58,
  cardGap: 13,
  sectionGap: 16,
  navHeight: 92,
  navInset: 112,
  buttonHeight: 58,
  loginButtonHeight: 68,
  avatar: 40,
};

export const shadow = {
  card: {
    shadowColor: '#6B8AA8',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  nav: {
    shadowColor: '#96A9BD',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 16,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

export const radius = {
  card: 16,
  input: 24,
  tile: 30,
  loginBtn: 15,
  pill: 999,
  nav: 48,
};

/** Pretendard 파일명 = RN fontFamily. fontWeight 쓰지 말 것. */
export const font = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extraBold: 'Pretendard-ExtraBold',
};

/** Android/custom OTF on TextInput hides typed characters — use system UI font. */
export const fieldFont: TextStyle = {};
export const fieldFontBold: TextStyle = {};

export const type = {
  logo: {
    fontFamily: font.extraBold,
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: 1,
  },
  display: {
    fontFamily: font.extraBold,
    fontSize: 25,
    lineHeight: 35,
    letterSpacing: -0.45,
  },
  title: {
    fontFamily: font.semiBold,
    fontSize: 22,
    lineHeight: 32,
    letterSpacing: -0.44,
  },
  heading: {
    fontFamily: font.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.45,
  },
  cardTitle: {
    fontFamily: font.extraBold,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.45,
  },
  body: {
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  sub: {
    fontFamily: font.medium,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  label: {
    fontFamily: font.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
  },
  button: {
    fontFamily: font.bold,
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0,
  },
  nav: {
    fontFamily: font.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  time: {
    fontFamily: font.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
};
