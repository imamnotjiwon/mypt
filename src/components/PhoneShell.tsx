import { ReactNode, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { PhoneStatusBar } from './PhoneStatusBar';

const PHONE_W = 402;
const PHONE_H = 874;

type Props = { children: ReactNode };

function ShellBody({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.column}>
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <SafeAreaInsetsContext.Provider value={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <View style={styles.column}>
        <View style={styles.content}>{children}</View>
        <View style={styles.statusOverlay} pointerEvents="none">
          <PhoneStatusBar />
        </View>
      </View>
    </SafeAreaInsetsContext.Provider>
  );
}

export function PhoneShell({ children }: Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const styleId = 'mypt-web-shell';
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent =
        'html,body,#root{height:100%;margin:0;background:#C9D6E5} body{overflow:hidden}';
      document.head.appendChild(style);
    }

    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale(Math.min(1, (w - 48) / PHONE_W, (h - 48) / PHONE_H));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const body = <ShellBody>{children}</ShellBody>;

  if (Platform.OS !== 'web') return body;

  return (
    <View style={styles.page}>
      <View style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
        <View
          style={[
            styles.phone,
            {
              transform: [{ scale }],
              // @ts-expect-error react-native-web
              transformOrigin: 'top left',
            },
          ]}
        >
          {body}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9D6E5',
  },
  phone: {
    width: PHONE_W,
    height: PHONE_H,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderRadius: 40,
    shadowColor: '#0F172A',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
  },
  column: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
  },
});
