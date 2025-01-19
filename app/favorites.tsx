import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [cardScale] = useState(new Animated.Value(1)); // Animacija skale za kartice
  const router = useRouter();

  const loadFavorites = async () => {
    try {
      const storedFavorites =
        JSON.parse(await AsyncStorage.getItem("favorites")) || [];
      setFavorites(storedFavorites);
      setFilteredFavorites(storedFavorites);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const removeFavorite = async (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const updatedFavorites = [...favorites];
    updatedFavorites.splice(index, 1); // Uklanjanje šale
    setFavorites(updatedFavorites);
    setFilteredFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));

    // Haptička povratna informacija
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateCard(); // Pokreće animaciju kartice
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

    // Haptička povratna informacija
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const filterFavorites = (text) => {
    setSearch(text);
    const filtered = favorites.filter((item) =>
      item.setup.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFavorites(filtered);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <LinearGradient colors={["#FF5F6D", "#FFC371"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Favorites</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search jokes..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={filterFavorites}
        />

        <FlatList
          data={filteredFavorites}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[styles.card, { transform: [{ scale: cardScale }] }]}
            >
              <Text style={styles.setup}>{item.setup}</Text>
              <Text style={styles.punchline}>{item.punchline}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => shareJoke(item)}
                >
                  <MaterialIcons name="share" size={20} color="#ffffff" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFavorite(index)}
                >
                  <MaterialIcons name="delete" size={20} color="#ffffff" />
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="sentiment-dissatisfied"
                size={80}
                color="#ffffff"
              />
              <Text style={styles.emptyText}>No favorites found.</Text>
            </View>
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
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "90%",
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
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
    color: "#FF5F6D",
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
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5F6D",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
