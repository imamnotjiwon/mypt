import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { gradient, layout, shadow, type } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={styles.wrap}>
      <LinearGradient colors={[...gradient.button]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={[styles.btn, disabled && styles.disabled]}>
        <AppText variant="button" style={styles.label}>
          {label}
        </AppText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    ...shadow.soft,
    borderRadius: 999,
  },
  btn: {
    height: layout.buttonHeight,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    ...type.button,
    color: '#fff',
  },
});
