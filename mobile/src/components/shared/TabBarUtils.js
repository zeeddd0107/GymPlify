import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useBottomTabOverflow() {
  const insets = useSafeAreaInsets();
  return {
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
}
