import { useBrand } from "@/context/BrandContext";
import { BrandKnowledgePage } from "@/pages/BrandKnowledgePage";
import CampaignGenerationPage from "@/pages/CampaignGenerationPage";
import { ReplyAssistantPage } from "@/pages/ReplyAssistantPage";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = {
  BRAND_KNOWLEDGE: "brandKnowledge",
  CAMPAIGN_GENERATOR: "campaignGenerator",
  REPLY_ASSISTANT: "replyAssistant",
};

export default function HomeScreen() {
  const [currentTab, setCurrentTab] = useState(TABS.BRAND_KNOWLEDGE);
  const { activeBrand } = useBrand();

  const renderTab = (key: string, label: string) => (
    <TouchableOpacity
      key={key}
      onPress={() => setCurrentTab(key)}
      style={[styles.tabButton, currentTab === key && styles.activeTabButton]}
    >
      <Text style={[styles.tabText, currentTab === key && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Active Brand Pill */}
      <View style={styles.brandBanner}>
        <Text style={styles.brandBannerText}>
          Active Brand:{" "}
          <Text style={styles.brandBannerName}>
            {activeBrand ? activeBrand.name : "None Selected"}
          </Text>
        </Text>
      </View>

      {/* Top Tab Switcher */}
      <View style={styles.tabBar}>
        {renderTab(TABS.BRAND_KNOWLEDGE, "Brands & Docs")}
        {renderTab(TABS.CAMPAIGN_GENERATOR, "Campaigns")}
        {renderTab(TABS.REPLY_ASSISTANT, "Reply Assistant")}
      </View>

      {/* Screen Views */}
      <View style={styles.content}>
        {currentTab === TABS.BRAND_KNOWLEDGE && <BrandKnowledgePage />}
        {currentTab === TABS.CAMPAIGN_GENERATOR && <CampaignGenerationPage />}
        {currentTab === TABS.REPLY_ASSISTANT && <ReplyAssistantPage />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  brandBanner: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 2,
  },
  brandBannerText: { fontSize: 12, color: "#6c757d" },
  brandBannerName: { fontWeight: "700", color: "#4F46E5" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    marginHorizontal: 16,
    marginTop: 6,
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
  tabText: { fontSize: 13, fontWeight: "600", color: "#6c757d" },
  activeTabText: { color: "#007AFF" },
  content: { flex: 1 },
});