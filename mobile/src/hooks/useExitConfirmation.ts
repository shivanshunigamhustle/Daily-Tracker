import { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";

/**
 * Shows an "Exit Application?" confirmation when the hardware back button
 * is pressed at the true root of navigation. React Navigation's own
 * NavigationContainer registers its back-handling listener on mount too;
 * since effects run child-first, this hook's listener is added before (and
 * so is called after) React Navigation's — meaning tab/stack history is
 * unwound first, and this only fires once there's nowhere left to go back to.
 */
export function useExitConfirmation() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setVisible(true);
      return true;
    });
    return () => subscription.remove();
  }, []);

  function confirmExit() {
    setVisible(false);
    BackHandler.exitApp();
  }

  function cancelExit() {
    setVisible(false);
  }

  return { visible, confirmExit, cancelExit };
}
