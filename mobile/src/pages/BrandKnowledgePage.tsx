
import { useBrand } from "@/context/BrandContext";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

interface BrandDocument {
  id: string;
  brand_id: string;
  title: string;
  raw_content: string;
  created_at?: string;
}

export const BrandKnowledgePage = () => {
  const {
    brands,
    activeBrand,
    setActiveBrand,
    loadingBrands,
    refreshBrands,
  } = useBrand();

  // Documents state
  const [documents, setDocuments] = useState<BrandDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Create Brand modal
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  // Add / Edit Document modal
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [editingDoc, setEditingDoc] = useState<BrandDocument | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [savingDoc, setSavingDoc] = useState(false);

  const fetchDocuments = async (brandId: string) => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${SERVER_URL}/brands/${brandId}/documents`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to fetch documents:", error?.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (activeBrand?.id) {
      fetchDocuments(activeBrand.id);
    } else {
      setDocuments([]);
    }
  }, [activeBrand?.id]);

  // ── Brand Actions ─────────────────────────────────────────
  const handleCreateBrand = async () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) {
      Alert.alert("Required", "Please enter a brand name.");
      return;
    }

    setSavingBrand(true);
    try {
      const res = await fetch(`${SERVER_URL}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          res.status === 409 ? "Brand Already Exists" : "Error",
          data.detail || "Could not create brand."
        );
        return;
      }

      setNewBrandName("");
      setBrandModalVisible(false);
      await refreshBrands(data.id);
    } catch (error: any) {
      Alert.alert("Network Error", error?.message || "Failed to reach server.");
    } finally {
      setSavingBrand(false);
    }
  };

  const handleDeleteBrand = () => {
    if (!activeBrand) return;
    Alert.alert(
      "Delete Brand",
      `Delete "${activeBrand.name}" and ALL its documents & embeddings?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${SERVER_URL}/brands/${activeBrand.id}`, {
                method: "DELETE",
              });
              if (!res.ok) throw new Error("Failed to delete brand");
              await refreshBrands();
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Delete failed.");
            }
          },
        },
      ]
    );
  };

  // ── Document Actions ──────────────────────────────────────
  const openAddDocModal = () => {
    setEditingDoc(null);
    setDocTitle("");
    setDocContent("");
    setDocModalVisible(true);
  };

  const openEditDocModal = (doc: BrandDocument) => {
    setEditingDoc(doc);
    setDocTitle(doc.title);
    setDocContent(doc.raw_content);
    setDocModalVisible(true);
  };

  const handleSaveDoc = async () => {
    if (!activeBrand) return;
    if (!docTitle.trim() || !docContent.trim()) {
      Alert.alert("Required", "Both title and content are required.");
      return;
    }

    setSavingDoc(true);
    try {
      const url = editingDoc
        ? `${SERVER_URL}/brands/${activeBrand.id}/documents/${editingDoc.id}`
        : `${SERVER_URL}/brands/${activeBrand.id}/documents`;

      const res = await fetch(url, {
        method: editingDoc ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_title: docTitle.trim(),
          content: docContent.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save document");
      }

      setDocModalVisible(false);
      await fetchDocuments(activeBrand.id);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Could not save document.");
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteDoc = (doc: BrandDocument) => {
    if (!activeBrand) return;
    Alert.alert("Delete Document", `Remove "${doc.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `${SERVER_URL}/brands/${activeBrand.id}/documents/${doc.id}`,
              { method: "DELETE" }
            );
            if (!res.ok) throw new Error("Delete failed");
            await fetchDocuments(activeBrand.id);
          } catch (error: any) {
            Alert.alert("Error", error?.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* ── Brand Section ─────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Brands</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setBrandModalVisible(true)}
        >
          <Text style={styles.primaryBtnText}>+ New Brand</Text>
        </TouchableOpacity>
      </View>

      {loadingBrands ? (
        <ActivityIndicator style={{ marginVertical: 12 }} />
      ) : brands.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No brands yet. Tap "+ New Brand" to register your first brand.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.brandStrip}
        >
          {brands.map((brand) => {
            const isSelected = activeBrand?.id === brand.id;
            return (
              <TouchableOpacity
                key={brand.id}
                onPress={() => setActiveBrand(brand)}
                style={[styles.brandPill, isSelected && styles.activeBrandPill]}
              >
                <Text
                  style={[
                    styles.brandPillText,
                    isSelected && styles.activeBrandPillText,
                  ]}
                >
                  {brand.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Documents Section (Same Window) ───────────── */}
      {activeBrand && (
        <View style={styles.docsContainer}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heading}>{activeBrand.name} Docs</Text>
              <Text style={styles.subheading}>
                Knowledge base used by AI Campaigns & Replies
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={styles.dangerOutlineBtn}
                onPress={handleDeleteBrand}
              >
                <Text style={styles.dangerOutlineText}>Delete Brand</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={openAddDocModal}
              >
                <Text style={styles.primaryBtnText}>+ Add Doc</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loadingDocs ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : documents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No documents for {activeBrand.name} yet. Tap "+ Add Doc" to
                ingest brand info.
              </Text>
            </View>
          ) : (
            documents.map((doc) => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docHeader}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <View style={styles.docActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEditDocModal(doc)}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteDoc(doc)}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.docPreview} numberOfLines={4}>
                  {doc.raw_content}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* ── Modal 1: Create Brand ─────────────────────── */}
      <Modal visible={brandModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Register New Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="Brand name (must be unique, e.g. V Perfumes)"
              value={newBrandName}
              onChangeText={setNewBrandName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setBrandModalVisible(false)}
                disabled={savingBrand}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleCreateBrand}
                disabled={savingBrand}
              >
                {savingBrand ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal 2: Add / Edit Document ──────────────── */}
      <Modal visible={docModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingDoc ? "Edit Document" : "Add Brand Document"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Document title (e.g. About & Outlets)"
              value={docTitle}
              onChangeText={setDocTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Paste verified brand facts, products, policies..."
              multiline
              value={docContent}
              onChangeText={setDocContent}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDocModalVisible(false)}
                disabled={savingDoc}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSaveDoc}
                disabled={savingDoc}
              >
                {savingDoc ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {editingDoc ? "Update & Re-embed" : "Save & Embed"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB", padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heading: { fontSize: 20, fontWeight: "700", color: "#172033" },
  subheading: { fontSize: 12, color: "#667085", marginTop: 2 },
  brandStrip: { marginBottom: 20 },
  brandPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE2EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  activeBrandPill: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  brandPillText: { fontSize: 14, fontWeight: "600", color: "#344054" },
  activeBrandPillText: { color: "#FFFFFF" },
  docsContainer: { marginTop: 8, paddingBottom: 40 },
  primaryBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  dangerOutlineBtn: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
  },
  dangerOutlineText: { color: "#B91C1C", fontSize: 12, fontWeight: "700" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8ECF3",
  },
  emptyText: { fontSize: 14, color: "#667085", textAlign: "center" },
  docCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8ECF3",
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  docTitle: { fontSize: 15, fontWeight: "700", color: "#172033", flex: 1 },
  docActions: { flexDirection: "row", gap: 8 },
  editBtn: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editBtnText: { color: "#4338CA", fontSize: 12, fontWeight: "700" },
  deleteBtn: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteBtnText: { color: "#B91C1C", fontSize: 12, fontWeight: "700" },
  docPreview: { fontSize: 13, color: "#475467", lineHeight: 20 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DCE2EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: { minHeight: 150, textAlignVertical: "top" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  cancelBtnText: { color: "#374151", fontSize: 13, fontWeight: "600" },
});