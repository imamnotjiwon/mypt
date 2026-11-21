import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

/** 운동별 전용 아이콘 — 흰 원 + 네이비(#194373) 실루엣 */
export const EXERCISE_ICONS = {
  water: require('../../assets/ui/icon-water.png'),
  pushup: require('../../assets/ui/icon-pushup.png'),
  squat: require('../../assets/ui/icon-squat.png'),
  plank: require('../../assets/ui/icon-plank.png'),
  lunge: require('../../assets/ui/icon-lunge.png'),
  burpee: require('../../assets/ui/icon-burpee.png'),
  shoulderpress: require('../../assets/ui/icon-shoulderpress.png'),
  bandrow: require('../../assets/ui/icon-bandrow.png'),
  yoga: require('../../assets/ui/icon-yoga.png'),
  foamroller: require('../../assets/ui/icon-foamroller.png'),
  bench: require('../../assets/ui/icon-bench.png'),
  deadlift: require('../../assets/ui/icon-deadlift.png'),
  latpulldown: require('../../assets/ui/icon-latpulldown.png'),
  legpress: require('../../assets/ui/icon-legpress.png'),
  treadmill: require('../../assets/ui/icon-treadmill.png'),
  cardio: require('../../assets/ui/icon-cardio.png'),
  run: require('../../assets/ui/icon-run.png'),
  walk: require('../../assets/ui/icon-walk.png'),
  cycle: require('../../assets/ui/icon-cycle.png'),
  lift: require('../../assets/ui/icon-lift.png'),
  weights: require('../../assets/ui/icon-weights.png'),
  stretch: require('../../assets/ui/icon-stretch.png'),
  stairs: require('../../assets/ui/icon-stairs.png'),
} as const;

export type ExerciseIconKey = keyof typeof EXERCISE_ICONS;

export function resolveExerciseIcon(key?: string | null): ImageSourcePropType {
  if (key && key in EXERCISE_ICONS) return EXERCISE_ICONS[key as ExerciseIconKey];
  return EXERCISE_ICONS.cardio;
}

export function ExerciseIcon({
  name,
  size = 48,
  style,
}: {
  name?: string | null;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={resolveExerciseIcon(name)}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
