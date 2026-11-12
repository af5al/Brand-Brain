import { BrandProvider } from "@/context/BrandContext";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <BrandProvider>
        <Slot />
      </BrandProvider>
    </SafeAreaProvider>
  );
}
