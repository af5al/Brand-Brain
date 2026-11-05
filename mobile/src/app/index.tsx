import CampaignGenerationPage from "@/pages/CampaignGenerationPage";
import { ReplyAssistantPage } from "@/pages/ReplyAssistantPage";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = {
  CAMPAIGN_GENERATOR: "campaignGenerator",
  REPLY_ASSISTANT: "replyAssistant",
};

export default function HomeScreen() {
  const [currentTab, setCurrentTab] = useState(TABS.CAMPAIGN_GENERATOR);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setCurrentTab(TABS.CAMPAIGN_GENERATOR)}
          style={[
            styles.tabButton,
            currentTab === TABS.CAMPAIGN_GENERATOR && styles.activeTabButton,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              currentTab === TABS.CAMPAIGN_GENERATOR && styles.activeTabText,
            ]}
          >
            Campaigns
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab(TABS.REPLY_ASSISTANT)}
          style={[
            styles.tabButton,
            currentTab === TABS.REPLY_ASSISTANT && styles.activeTabButton,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              currentTab === TABS.REPLY_ASSISTANT && styles.activeTabText,
            ]}
          >
            Reply Assistant
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Views */}
      <View style={styles.content}>
        {currentTab === TABS.CAMPAIGN_GENERATOR && <CampaignGenerationPage />}
        {currentTab === TABS.REPLY_ASSISTANT && <ReplyAssistantPage />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
  },
  activeTabText: {
    color: "#007AFF",
  },
  content: {
    flex: 1,
  },
});
