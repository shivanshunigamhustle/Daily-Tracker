import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Subtle, fast, purposeful — per the design direction, not decorative.
export const duration = {
  micro: 120,
  small: 180,
  standard: 250,
  large: 380,
};

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduced(value);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

// Caps staggered-entrance delay so long lists don't animate forever —
// only the first screenful gets the effect, per "don't animate hundreds
// of items simultaneously".
export function staggerDelay(index: number, reducedMotion: boolean, step = 30, max = 10): number {
  if (reducedMotion) return 0;
  return Math.min(index, max) * step;
}
