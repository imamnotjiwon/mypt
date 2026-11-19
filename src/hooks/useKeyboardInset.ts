import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export function useKeyboardInset() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (event) => {
      setHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
