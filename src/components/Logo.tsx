import { AppText } from './AppText';
import { colors } from '../theme';

/** 로고 에셋은 나중에 교체. 지금은 자리만 잡아 둔다. */
export function Logo({ size = 42 }: { size?: number }) {
  return (
    <AppText
      variant="logo"
      style={{
        fontSize: size,
        lineHeight: size + 8,
        color: colors.navy,
        textAlign: 'center',
      }}
    >
      MYPT
    </AppText>
  );
}
