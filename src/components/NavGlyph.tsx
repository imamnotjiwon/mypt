import { AppText } from './AppText';
import { colors, font } from '../theme';

export function BackGlyph({ color = colors.navy }: { color?: string }) {
  return (
    <AppText style={{ fontFamily: font.bold, fontSize: 28, lineHeight: 32, color, backgroundColor: 'transparent' }}>
      ‹
    </AppText>
  );
}

export function CloseGlyph({ color = colors.navy }: { color?: string }) {
  return (
    <AppText style={{ fontFamily: font.bold, fontSize: 26, lineHeight: 32, color, backgroundColor: 'transparent' }}>
      ×
    </AppText>
  );
}
