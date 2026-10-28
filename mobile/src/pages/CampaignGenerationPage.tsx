import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CampaignDetailsType {
  productName: string;
  channel: "instagram" | "whatsapp" | "email";
  language: "english" | "arabic";
  campaign: CampaignResponse | null;
  loading: boolean;
  approvedStatus: boolean;
}

interface CampaignResponse {
  headline: string;
  body_copy: string;
  call_to_action: string;
  hashtags: [];
  is_rtl: boolean;
  grounded_facts_used: [];
}

const initialCampaignDetails: CampaignDetailsType = {
  productName: "Mango Ice Cream Cone",
  channel: "instagram",
  language: "english",
  campaign: null,
  loading: false,
  approvedStatus: false,
};

const BACKEND_URL = "http://192.168.0.171:8000";
const IGLOO_BRAND_ID = "e58a326e-9ce7-4663-97b5-0fe7e781a058";

const CampaignGenerationPage = () => {
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetailsType>(
    initialCampaignDetails,
  );

  const handleGenerateCampaign = async () => {
    setCampaignDetails((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/campaigns/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: IGLOO_BRAND_ID,
          product_name: campaignDetails.productName,
          channel: campaignDetails.channel,
          language: campaignDetails.language,
        }),
      });

      const data = await res.json();
      setCampaignDetails((prev) => ({
        ...prev,
        campaign: data.results,
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to generate campaign", error);
      setCampaignDetails((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleShareCampaign = async () => {
    if (!campaignDetails.campaign || !campaignDetails.approvedStatus) return;

    const c = campaignDetails.campaign;
    const fullMessage = `${c.headline}\n\n${c.body_copy}\n\n👉 ${c.call_to_action}\n\n${c.hashtags.map((t: string) => `#${t.replace(/^#/, "")}`).join(" ")}`;
    try {
      await Share.share({
        message: fullMessage,
        title: `${campaignDetails.productName} Campaign`,
      });
    } catch (error: any) {
      Alert.alert("Error sharing", error?.message);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <Text style={styles.heading}>Campaign Generation</Text>

        <View style={styles.inputAreaView}>
          <Text style={styles.inputLabel}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={campaignDetails.productName}
            onChangeText={(text) =>
              setCampaignDetails((prev) => ({ ...prev, productName: text }))
            }
            placeholder="Enter product name (e.g. Mango Ice Cream Cone)"
          />
          {/* Channel Selector */}
          <Text style={styles.inputLabel}>Channel</Text>

          <View style={styles.row}>
            {(["instagram", "whatsapp", "email"] as const).map((ch) => (
              <TouchableOpacity
                key={ch}
                onPress={() =>
                  setCampaignDetails((prev) => ({ ...prev, channel: ch }))
                }
                style={[
                  styles.chip,
                  campaignDetails.channel === ch && styles.activeChip,
                ]}
              >
                <Text
                  style={
                    campaignDetails.channel === ch
                      ? styles.activeText
                      : styles.chipText
                  }
                >
                  {ch.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Language Selector */}
          <Text style={styles.inputLabel}>Language</Text>

          <View style={styles.row}>
            {(["english", "arabic"] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() =>
                  setCampaignDetails((prev) => ({ ...prev, language: lang }))
                }
                style={[
                  styles.chip,
                  campaignDetails.language === lang && styles.activeChip,
                ]}
              >
                <Text
                  style={
                    campaignDetails.language === lang
                      ? styles.activeText
                      : styles.chipText
                  }
                >
                  {lang === "arabic" ? "العربية" : "ENGLISH"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setCampaignDetails(initialCampaignDetails)}
              disabled={campaignDetails.loading}
            >
              <Text style={{ ...styles.bottomButtons, backgroundColor: "red" }}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGenerateCampaign}
              disabled={campaignDetails.loading}
            >
              <Text
                style={{ ...styles.bottomButtons, backgroundColor: "green" }}
              >
                Generate
              </Text>
            </TouchableOpacity>

            {campaignDetails.loading && <ActivityIndicator />}
          </View>
        </View>

        {/* result rendering area */}
        {campaignDetails.campaign && (
          <View style={styles.resultCard}>
            {/* Dynamic RTL Headline */}
            <Text
              style={[
                styles.headline,
                {
                  textAlign: campaignDetails.campaign.is_rtl ? "right" : "left",
                  writingDirection: campaignDetails.campaign.is_rtl
                    ? "rtl"
                    : "ltr",
                },
              ]}
            >
              {campaignDetails.campaign.headline}
            </Text>

            {/* Dynamic RTL Body Copy */}
            <Text
              style={[
                styles.bodyCopy,
                {
                  textAlign: campaignDetails.campaign.is_rtl ? "right" : "left",
                  writingDirection: campaignDetails.campaign.is_rtl
                    ? "rtl"
                    : "ltr",
                },
              ]}
            >
              {campaignDetails.campaign.body_copy}
            </Text>

            {/* Call to Action */}
            <View style={styles.ctaBadge}>
              <Text style={styles.ctaText}>
                👉 {campaignDetails.campaign.call_to_action}
              </Text>
            </View>

            {/* Hashtags */}
            <View style={styles.hashtagRow}>
              {campaignDetails.campaign.hashtags.map((tag: string, idx) => (
                <Text key={idx} style={styles.hashtag}>
                  #{tag.replace(/^#/, "")}
                </Text>
              ))}
            </View>

            {/* Grounded Evidence Box */}
            <View style={styles.groundedBox}>
              <Text style={styles.groundedTitle}>
                ✅ Grounded Brand Facts Used:
              </Text>
              {campaignDetails.campaign.grounded_facts_used.map((fact, idx) => (
                <Text key={idx} style={styles.groundedFact}>
                  • {fact}
                </Text>
              ))}
            </View>

            {/* Human-in-the-Loop Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() =>
                  setCampaignDetails((prev) => ({
                    ...prev,
                    approvedStatus: true,
                  }))
                }
                style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
              >
                <Text style={styles.actionBtnText}>
                  {campaignDetails.approvedStatus ? "✓ Approved" : "Approve"}
                </Text>
              </TouchableOpacity>
              {campaignDetails.approvedStatus ? (
                <TouchableOpacity
                  onPress={handleShareCampaign}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: "#007AFF", marginBottom: 8 },
                  ]}
                >
                  <Text style={styles.actionBtnText}>📋 Copy / Share</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    setCampaignDetails((prev) => ({ ...prev, campaign: null }))
                  }
                  style={[styles.actionBtn, { backgroundColor: "#dc3545" }]}
                >
                  <Text style={styles.actionBtnText}>Reject</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 25,
    padding: 10,
    fontWeight: "700",
    marginLeft: 6,
  },
  inputAreaView: {
    padding: 10,
    margin: 10,
  },
  inputLabel: {},
  bottomButtons: {
    color: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    marginVertical: 10,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginVertical: 10,
  },
  container: { padding: 16, justifyContent: "center", flex: 1 },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: { fontSize: 16, color: "gray" },
  selectedTextStyle: { fontSize: 16 },
  inputSearchStyle: { height: 40, fontSize: 16 },
  row: { flexDirection: "row", gap: 10, marginVertical: 8 },
  chip: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  activeChip: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#555" },
  activeText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headline: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  bodyCopy: { fontSize: 15, lineHeight: 22, color: "#333", marginBottom: 12 },
  ctaBadge: {
    backgroundColor: "#f0f4ff",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  ctaText: { color: "#0066cc", fontWeight: "600", fontSize: 14 },
  hashtagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  hashtag: { color: "#0088cc", fontSize: 13, fontWeight: "500" },
  groundedBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  groundedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#28a745",
    marginBottom: 4,
  },
  groundedFact: { fontSize: 12, color: "#555", fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});

export default CampaignGenerationPage;
