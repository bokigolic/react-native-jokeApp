import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";

// Omogućavanje LayoutAnimation za Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();

  const loadFavorites = async () => {
    try {
      const storedFavorites =
        JSON.parse(await AsyncStorage.getItem("favorites")) || [];
      setFavorites(storedFavorites);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const removeFavorite = async (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const updatedFavorites = [...favorites];
    updatedFavorites.splice(index, 1); // Uklanjanje šale
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const shareJoke = async (joke) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(
        "Sharing not available",
        "This feature is not supported on this device."
      );
      return;
    }

    const message = `${joke.setup}\n\n${joke.punchline}`;
    await Sharing.shareAsync(null, {
      dialogTitle: "Share Joke",
      text: message,
    });
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <LinearGradient colors={["#6C63FF", "#96E6FF"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Favorites</Text>

        <FlatList
          data={favorites}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.setup}>{item.setup}</Text>
              <Text style={styles.punchline}>{item.punchline}</Text>

              <View style={styles.buttonRow}>
                {/* Dugme za deljenje šale */}
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => shareJoke(item)}
                >
                  <MaterialIcons name="share" size={20} color="#ffffff" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>

                {/* Dugme za uklanjanje šale */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    Alert.alert(
                      "Remove Favorite",
                      "Are you sure you want to remove this joke?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          onPress: () => removeFavorite(index),
                        },
                      ]
                    )
                  }
                >
                  <MaterialIcons name="delete" size={20} color="#ffffff" />
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You don't have any favorite jokes yet.
            </Text>
          }
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    alignItems: "center",
  },
  setup: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  punchline: {
    fontSize: 18,
    color: "#6C63FF",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  shareButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4D4F",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  emptyText: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
