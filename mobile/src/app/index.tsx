import { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [healthStatus, setHealthStatus] = useState("");
  const [geminiStatus, setGeminiStatus] = useState("");
  const [healthLoading, setHealthLoading] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [error, setError] = useState("");

  const backendApi = `http://192.168.0.171:8000`;

  const handleClickHealthCheck = async () => {
    setHealthLoading(true);
    try {
      const result = await fetch(`${backendApi}/health`);
      const data = await result.json();
      console.log("result", data);
      setHealthStatus(data?.message);
    } catch (error: any) {
      console.error(error?.message);
      setError(`error on fetching: ${error?.message}`);
    } finally {
      setHealthLoading(false);
    }
  };

  const handleGeminiHealthCheck = async () => {
    setGeminiLoading(true);
    try {
      const result = await fetch(`${backendApi}/test-gemini`);
      const data = await result.json();
      console.log("result", data);
      setGeminiStatus(data?.output);
    } catch (error: any) {
      console.error(error?.message);
      setError(`error on fetching: ${error?.message}`);
    } finally {
      setGeminiLoading(false);
    }
  };

  return (
      <SafeAreaView style={styles.SafeArea}>
        <Text style={styles.headingText}> Brand Brain </Text>
        <Button
          title="check backend health"
          color="blue"
          onPress={handleClickHealthCheck}
        />
        {healthLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.subText}>Status: {healthStatus}</Text>
        )}


        <Button title="check health" color="green" onPress={handleGeminiHealthCheck}/>
        {geminiLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.subText}>Status: {geminiStatus}</Text>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  SafeArea: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  headingText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: "red",
  },
});
