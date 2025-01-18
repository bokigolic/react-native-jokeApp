import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Favorites() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <Button title="Back to Home" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
});
