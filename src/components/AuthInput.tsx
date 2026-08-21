import { Platform, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { AppText } from './AppText';
import { colors, fieldFont, font } from '../theme';

type Props = TextInputProps & {
  label?: string;
};

export function AuthInput({ label, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <View style={styles.box}>
        <TextInput
          {...props}
          placeholderTextColor="#8A939C"
          selectionColor={colors.navy}
          underlineColorAndroid="transparent"
          autoCorrect={false}
          importantForAutofill="no"
          style={[styles.input, style]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontFamily: font.medium, fontSize: 14, lineHeight: 18, color: colors.text },
  box: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C5D0DC',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 54,
    ...fieldFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#111111',
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : null),
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0 } : null),
  },
});
