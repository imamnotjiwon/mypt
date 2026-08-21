import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, space } from '../theme';

type Props = {
  children: ReactNode;
  padded?: boolean;
  bottomNav?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, padded = true, bottomNav = false, style }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <View
        style={[
          styles.body,
          padded && { paddingHorizontal: layout.screen },
          bottomNav && { paddingBottom: layout.navInset },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  body: {
    flex: 1,
    paddingTop: space[8],
  },
});
