import { useCallback, useEffect, useRef, useState } from "react";

// A minimal structural type covering just what this hook calls, so it
// accepts whatever `useNavigation()` returns regardless of the specific
// param-list generic a screen happens to be typed with.
interface NavigationLike {
  addListener: (event: "beforeRemove", callback: (e: any) => void) => () => void;
  dispatch: (action: any) => void;
}

interface UnsavedChangesGuardOptions {
  navigation: NavigationLike;
  /** Whether the screen currently has unsaved input. */
  isDirty: boolean;
}

/**
 * Intercepts every way of leaving a screen — header back button, swipe-back
 * gesture, and the Android hardware back button — via React Navigation's
 * `beforeRemove` event, showing a discard-confirmation dialog when the form
 * is dirty. Confirming replays the navigation action that was blocked.
 */
export function useUnsavedChangesGuard({ navigation, isDirty }: UnsavedChangesGuardOptions) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const pendingActionRef = useRef<unknown>(null);
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Set synchronously (not via setState) right before an intentional
  // navigate-away — e.g. after a successful save — so the `beforeRemove`
  // listener sees it immediately, with no React re-render race, and lets
  // that one navigation through even though the form still has content.
  const bypassOnceRef = useRef(false);
  const allowNextNavigation = useCallback(() => {
    bypassOnceRef.current = true;
  }, []);

  useEffect(() => {
    return navigation.addListener("beforeRemove", (e: any) => {
      if (bypassOnceRef.current) {
        bypassOnceRef.current = false;
        return;
      }
      if (!isDirtyRef.current) return;
      e.preventDefault();
      pendingActionRef.current = e.data.action;
      setDialogVisible(true);
    });
  }, [navigation]);

  function confirmDiscard() {
    setDialogVisible(false);
    if (pendingActionRef.current) {
      navigation.dispatch(pendingActionRef.current as never);
      pendingActionRef.current = null;
    }
  }

  function cancelDiscard() {
    setDialogVisible(false);
    pendingActionRef.current = null;
  }

  return { dialogVisible, confirmDiscard, cancelDiscard, allowNextNavigation };
}
