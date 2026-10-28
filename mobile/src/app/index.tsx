import CampaignGenerationPage from "@/pages/CampaignGenerationPage";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  // const backendApi =  `http://192.168.0.171:8000`;

  return (
    <SafeAreaView style={styles.SafeArea}>
      <CampaignGenerationPage />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  SafeArea: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
});
