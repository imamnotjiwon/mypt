import { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Character, CHARACTERS } from '../data/characters';
import { useDesignScale } from '../hooks/useDesignScale';
import { FloorShadow } from './FloorShadow';

type Props = {
  index: number;
  onIndexChange: (index: number) => void;
};

const BASE_H = 248;

function Slot({
  character,
  width,
  height,
  shadowW,
}: {
  character: Character;
  width: number;
  height: number;
  shadowW: number;
}) {
  const shadowH = Math.round(shadowW * 0.32);
  const overflow = Math.round(shadowH * 0.28);
  return (
    <View style={[styles.slotInner, { width, height: height + overflow }]}>
      <FloorShadow
        width={shadowW}
        height={shadowH}
        style={[styles.shadow, { bottom: -Math.round(shadowH * 0.16) }]}
      />
      <Image
        source={character.body}
        style={{
          width,
          height,
          marginBottom: overflow,
          zIndex: 2,
          transform: [{ translateX: Math.round(width * (character.nudgeX ?? 0)) }],
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export function CharacterCarousel({ index, onIndexChange }: Props) {
  const listRef = useRef<FlatList<Character>>(null);
  const indexRef = useRef(index);
  const onChangeRef = useRef(onIndexChange);
  const suppress = useRef(false);
  const s = useDesignScale();
  const { width: screenW } = useWindowDimensions();

  indexRef.current = index;
  onChangeRef.current = onIndexChange;

  const cellW = Math.round(156 * s);
  const gap = Math.round(18 * s);
  const stride = cellW + gap;
  const sidePad = Math.max(0, (screenW - cellW) / 2);

  const scrollTo = useCallback(
    (i: number, animated: boolean) => {
      suppress.current = true;
      listRef.current?.scrollToOffset({ offset: i * stride, animated });
      // release after settle so programmatic scroll doesn't re-fire onIndexChange
      setTimeout(() => {
        suppress.current = false;
      }, animated ? 320 : 48);
    },
    [stride],
  );

  useEffect(() => {
    scrollTo(index, false);
  }, [index, scrollTo]);

  const commitFromOffset = (x: number) => {
    if (suppress.current) return;
    const i = Math.max(0, Math.min(CHARACTERS.length - 1, Math.round(x / stride)));
    if (i !== indexRef.current) onChangeRef.current(i);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    commitFromOffset(e.nativeEvent.contentOffset.x);
  };

  return (
    <View style={[styles.clip, Platform.OS === 'web' ? styles.webTouch : null]}>
      <FlatList
        ref={listRef}
        horizontal
        data={CHARACTERS}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        bounces
        overScrollMode="never"
        snapToInterval={stride}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: sidePad,
          paddingBottom: 36,
          alignItems: 'flex-end',
        }}
        style={styles.list}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        getItemLayout={(_, i) => ({ length: stride, offset: stride * i, index: i })}
        renderItem={({ item, index: i }) => {
          const h = Math.round(BASE_H * item.bodyScale * s);
          const w = Math.round(h * 0.74);
          return (
            <Pressable
              style={{ width: stride, alignItems: 'center', justifyContent: 'flex-end' }}
              onPress={() => {
                if (i === indexRef.current) return;
                onChangeRef.current(i);
                scrollTo(i, true);
              }}
            >
              <Slot character={item} width={w} height={h} shadowW={Math.round(w * 1.05)} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: -24,
  },
  list: {
    flex: 1,
  },
  webTouch: {
    ...(Platform.OS === 'web'
      ? ({ touchAction: 'pan-x', userSelect: 'none', cursor: 'grab' } as object)
      : null),
  },
  slotInner: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadow: {
    position: 'absolute',
    zIndex: 1,
  },
});
