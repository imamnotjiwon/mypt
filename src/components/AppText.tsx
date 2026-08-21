import { Text, TextProps } from 'react-native';
import { type } from '../theme';

export type TextVariant = keyof typeof type;

type Props = TextProps & {
  variant?: TextVariant;
};

export function AppText({ variant = 'body', style, ...props }: Props) {
  return <Text {...props} style={[type[variant], style]} />;
}
