import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme';

export const STATUS_BAR_HEIGHT = 54;

export function PhoneStatusBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: false });

  return (
    <View style={styles.bar} pointerEvents="none">
      <Text style={styles.time}>{time}</Text>
      <View style={styles.levels}>
        <Signal />
        <Wifi />
        <Battery />
      </View>
    </View>
  );
}

function Signal() {
  return (
    <View style={styles.signal}>
      {[4, 7, 10, 13].map((h, i) => (
        <View key={i} style={[styles.barBit, { height: h, opacity: i === 0 ? 0.4 : 1 }]} />
      ))}
    </View>
  );
}

function Wifi() {
  return (
    <View style={styles.wifi}>
      <View style={[styles.wifiArc, { width: 16, height: 16, borderRadius: 8 }]} />
      <View style={[styles.wifiArc, { width: 10, height: 10, borderRadius: 5 }]} />
      <View style={styles.wifiDot} />
    </View>
  );
}

function Battery() {
  return (
    <View style={styles.batteryWrap}>
      <View style={styles.batteryBody}>
        <View style={styles.batteryFill} />
      </View>
      <View style={styles.batteryTip} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: STATUS_BAR_HEIGHT,
    paddingTop: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    zIndex: 30,
  },
  time: {
    fontFamily: font.semiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.black,
    letterSpacing: -0.4,
    width: 96,
  },
  levels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: 96,
    justifyContent: 'flex-end',
  },
  signal: {
    width: 18,
    height: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
  },
  barBit: {
    width: 3,
    borderRadius: 1,
    backgroundColor: colors.black,
  },
  wifi: {
    width: 16,
    height: 13,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  wifiArc: {
    position: 'absolute',
    borderColor: colors.black,
    borderTopWidth: 1.6,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderBottomWidth: 0,
    bottom: 3,
  },
  wifiDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.black,
    marginBottom: 1,
  },
  batteryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 25,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: colors.black,
    padding: 1.5,
    justifyContent: 'center',
  },
  batteryFill: {
    width: '78%',
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: colors.black,
  },
  batteryTip: {
    width: 1.6,
    height: 5,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    backgroundColor: colors.black,
    marginLeft: 1,
    opacity: 0.45,
  },
});
