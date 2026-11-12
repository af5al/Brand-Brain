import { useBrand } from "@/context/BrandContext";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ReplyResult {
  intent: "faq" | "lead" | "complaint" | "out_of_scope";
  action: "reply_drafted" | "escalate_to_human";
  draft_reply: string;
  confidence_score: number;
  escalation_reason?: string;
  grounded_facts_used: string[];
}

export const ReplyAssistantPage = () => {
  const [customerMessage, setCustomerMessage] = useState("");
  const [channel, setChannel] = useState<"instagram" | "whatsapp" | "email">(
    "whatsapp",
  );
  const [loading, setLoading] = useState(false);
  const [replyResult, setReplyResult] = useState<ReplyResult | null>(null);
  const { activeBrand } = useBrand();

  useEffect(() => {
    setReplyResult(null);
  }, [activeBrand?.id]);

  const handleDraftReply = async () => {
    if (!activeBrand) {
      Alert.alert(
        "No Brand Selected",
        "Select or create a brand in Brands & Docs first.",
      );
      return;
    }
    setLoading(true);
    try {
      const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL;
      const response = await fetch(`${serverUrl}/replies/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: activeBrand.id,
          customer_message: customerMessage,
          channel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.detail || "Failed to draft reply.");
        return;
      }
      setReplyResult(data);
    } catch (error: any) {
      console.error("failed to fetch drafted reply", error?.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Customer Reply Assistant</Text>
      <Text style={styles.subheading}>Grounding & Refusal Guardrails</Text>

      {/* Quick Test Chips for Demos */}
      <Text style={styles.sectionLabel}>Quick Test Scenarios:</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={styles.chip}
          onPress={() =>
            setCustomerMessage(
              "Do you use artificial colors in your ice cream?",
            )
          }
        >
          <Text style={styles.chipText}>✅ Test Supported FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chip}
          onPress={() =>
            setCustomerMessage(
              "Can I buy cryptocurrency or stocks through your company?",
            )
          }
        >
          <Text style={styles.chipText}>🚨 Test Escalation</Text>
        </TouchableOpacity>
      </View>

      {/* Customer Message Input */}
      <Text style={styles.sectionLabel}>Customer Message:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={3}
        placeholder="Type incoming customer message..."
        value={customerMessage}
        onChangeText={setCustomerMessage}
      />

      {/* Action Button */}
      <TouchableOpacity
        style={styles.generateBtn}
        onPress={handleDraftReply}
        disabled={loading || !customerMessage.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateBtnText}>Analyze & Draft Reply</Text>
        )}
      </TouchableOpacity>

      {/* Result Card */}
      {replyResult && (
        <View style={styles.resultCard}>
          {/* Intent & Action Header */}
          <View style={styles.headerRow}>
            <View style={styles.intentBadge}>
              <Text style={styles.intentText}>
                {replyResult.intent.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.actionBadge,
                {
                  backgroundColor:
                    replyResult.action === "reply_drafted"
                      ? "#e6f4ea"
                      : "#fce8e6",
                },
              ]}
            >
              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      replyResult.action === "reply_drafted"
                        ? "#137333"
                        : "#c5221f",
                  },
                ]}
              >
                {replyResult.action === "reply_drafted"
                  ? "✓ Grounded Draft"
                  : "🚨 Escalated to Human"}
              </Text>
            </View>
          </View>

          {/* Confidence Score */}
          <Text style={styles.confidenceText}>
            Evidence Confidence:{" "}
            {(replyResult.confidence_score * 100).toFixed(1)}%
          </Text>

          {/* Draft Message */}
          <Text style={styles.draftBox}>{replyResult.draft_reply}</Text>

          {/* Grounded Evidence or Escalation Reason */}
          {replyResult.action === "reply_drafted" &&
            replyResult.grounded_facts_used.length > 0 && (
              <View style={styles.groundedBox}>
                <Text style={styles.groundedTitle}>
                  Verified Brand Facts Used:
                </Text>
                {replyResult.grounded_facts_used.map((fact, i) => (
                  <Text key={i} style={styles.groundedFact}>
                    • {fact}
                  </Text>
                ))}
              </View>
            )}

          {replyResult.action === "escalate_to_human" && (
            <View style={styles.escalationBox}>
              <Text style={styles.escalationTitle}>Reason for Escalation:</Text>
              <Text style={styles.escalationText}>
                {replyResult.escalation_reason}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Page Header
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 6,
  },

  subheading: {
    fontSize: 14,
    color: "#788397",
    marginBottom: 28,
  },

  // Section Labels
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#263247",
    marginBottom: 12,
    marginTop: 8,
  },

  // Quick Test Chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  chip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7F0",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 1,
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#344054",
  },

  // Input
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE2EB",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: "#263247",
    minHeight: 110,
    textAlignVertical: "top",
    marginBottom: 20,
  },

  // Generate Button
  generateBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    elevation: 3,
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Result Card
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E8ECF3",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  // Result Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },

  intentBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  intentText: {
    color: "#4338CA",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  actionText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Confidence Score
  confidenceText: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "600",
    marginBottom: 14,
  },

  // Draft Reply
  draftBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E7ECF3",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    lineHeight: 23,
    color: "#344054",
    marginBottom: 18,
  },

  // Grounded Facts
  groundedBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  groundedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 10,
  },

  groundedFact: {
    fontSize: 13,
    lineHeight: 21,
    color: "#166534",
    marginBottom: 5,
  },

  // Escalation
  escalationBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  escalationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 8,
  },

  escalationText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#991B1B",
  },
});
