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
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function Home() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonScale] = useState(new Animated.Value(1)); // Animacija dugmadi
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

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }

      const updatedFavorites = [...storedFavorites, joke];
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error saving joke:", error);
    }
  };

  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <LinearGradient colors={["#FF7E5F", "#FEB47B"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Random Joke App</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          joke && (
            <Animated.View
              style={[styles.card, { transform: [{ scale: buttonScale }] }]}
            >
              <Text style={styles.setup}>{joke.setup}</Text>
              <Text style={styles.punchline}>{joke.punchline}</Text>
            </Animated.View>
          )
        )}

        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={fetchJoke}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <MaterialIcons name="refresh" size={24} color="#ffffff" />
              <Text style={styles.iconButtonText}>New Joke</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={saveFavorite}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <MaterialIcons name="favorite-border" size={24} color="#ffffff" />
              <Text style={styles.iconButtonText}>Save</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/favorites")}
        >
          <Text style={styles.navButtonText}>Go to Favorites</Text>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  setup: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  punchline: {
    fontSize: 20,
    color: "#FF7E5F",
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
    backgroundColor: "#FF7E5F",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
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
    borderColor: "#FF7E5F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  navButtonText: {
    color: "#FF7E5F",
    fontSize: 16,
    fontWeight: "bold",
  },
});
