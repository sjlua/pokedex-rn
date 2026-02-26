import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colours } from "../../constants/colours";

export default function Info() {
  // Force re-render to fix color scheme detection on initial load
  const [mounted, setMounted] = useState<boolean>(false);

  // Get the colour scheme from app.json userInterfaceStyle, null fallback is light
  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  // useEffect to handle initial mount for color scheme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until color scheme is properly detected
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10,
        padding: 10,
        backgroundColor: theme.background,
      }}
    >
      <Text style={{ fontSize: 20, color: theme.text }}>
        {`This is a test project made by me to learn React, React Native and Expo.\n\nHuge thanks to pokeapi.co, without them, this wouldn't be possible at all.`}
      </Text>
      <Pressable
        style={[styles.linkButton, { backgroundColor: theme.uiBackground }]}
        accessibilityLabel="Visit pokeapi.co"
        onPress={() => {
          const url = `https://pokeapi.co`;
          Linking.openURL(url).catch((err) =>
            console.log("Failed to open URL", err),
          );
        }}
      >
        <MaterialIcons name="open-in-new" size={18} color={theme.text} />
        <Text style={[styles.linkButtonText, { color: theme.text }]}>
          Visit pokeapi.co
        </Text>
      </Pressable>
      <View style={{ marginTop: "auto" }}>
        <Text style={{ fontSize: 14, color: theme.title }}>
          {`Trainer Sean`}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    width: "100%",
  },

  linkButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
