import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  REACTION_DISPLAY_MS,
  REACTION_ENTER_MS,
  REACTION_EXIT_MS,
} from "@/constants/game";
import { formatTime } from "@/utils/game";

export function ReactionTimeBadge({
  ms,
  color,
  onHide,
}: {
  ms: number;
  color: string;
  onHide: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: REACTION_ENTER_MS });
    translateY.value = withTiming(0, { duration: REACTION_ENTER_MS });

    const t = setTimeout(() => {
      opacity.value = withTiming(
        0,
        { duration: REACTION_EXIT_MS },
        finished => {
          if (finished) runOnJS(onHide)();
        },
      );
      translateY.value = withTiming(-20, { duration: REACTION_EXIT_MS });
    }, REACTION_DISPLAY_MS);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.text, { color }, animStyle]}>
      {formatTime(ms)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
