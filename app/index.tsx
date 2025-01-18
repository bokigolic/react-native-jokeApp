import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function Home() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState(false);
  const fadeAnim = new Animated.Value(0); // Animacija za fade-in i fade-out
  const router = useRouter();

  const fetchJoke = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://official-joke-api.appspot.com/random_joke"
      );
      const data = await response.json();
      setJoke(data);
    } catch (error) {
      console.error("Error fetching joke:", error);
    } finally {
      setLoading(false);
    }
  };

  const showConfirmation = () => {
    setConfirmationMessage(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setConfirmationMessage(false));
    }, 3000);
  };

  const saveFavorite = async () => {
    if (!joke) return;

    try {
      const storedFavorites =
        JSON.parse(await AsyncStorage.getItem("favorites")) || [];
      const isAlreadySaved = storedFavorites.some(
        (item) => item.id === joke.id
      );

      if (isAlreadySaved) {
        showConfirmation();
        return;
      }

      const updatedFavorites = [...storedFavorites, joke];
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      showConfirmation();
    } catch (error) {
      console.error("Error saving joke:", error);
    }
  };

  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <LinearGradient colors={["#6C63FF", "#96E6FF"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Random Joke App</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          joke && (
            <View style={styles.card}>
              <Text style={styles.setup}>{joke.setup}</Text>
              <Text style={styles.punchline}>{joke.punchline}</Text>
            </View>
          )
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={fetchJoke}>
            <MaterialIcons name="refresh" size={24} color="#ffffff" />
            <Text style={styles.iconButtonText}>New Joke</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={saveFavorite}>
            <MaterialIcons name="favorite-border" size={24} color="#ffffff" />
            <Text style={styles.iconButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/favorites")}
        >
          <Text style={styles.navButtonText}>Go to Favorites</Text>
        </TouchableOpacity>

        {confirmationMessage && (
          <Animated.View
            style={[styles.confirmationBox, { opacity: fadeAnim }]}
          >
            <Text style={styles.confirmationText}>Joke Saved!</Text>
          </Animated.View>
        )}
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
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
    marginBottom: 20,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  iconButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  navButton: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: "#6C63FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  navButtonText: {
    color: "#6C63FF",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmationBox: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  confirmationText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
