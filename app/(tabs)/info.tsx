import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import {
  Button,
  Linking,
  Platform,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Colours } from "../../constants/colours";

export default function Info() {
  const bottomBarTabHeight = useBottomTabBarHeight();

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
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10,
        padding: 10,
        paddingBottom: 10 + bottomBarTabHeight,
        backgroundColor: theme.background,
      }}
    >
      <Text style={{ fontSize: 20, color: theme.text }}>
        {`This is a test project made by me to learn React, React Native and Expo.\n\nHuge thanks to pokeapi.co, without them, this wouldn't be possible at all.`}
      </Text>
      <Button
        title={"Visit pokeapi.co"}
        color={
          Platform.OS === "ios"
            ? theme.iconColorFocused
            : theme.buttonBackground
        }
        onPress={() => {
          const url = `https://pokeapi.co`;
          Linking.openURL(url).catch((err) =>
            console.log("Failed to open URL", err),
          );
        }}
      ></Button>
      <View style={{ marginTop: "auto" }}>
        <Text style={{ fontSize: 14, color: theme.title }}>
          {`Trainer Sean`}
        </Text>
      </View>
    </View>
  );
}
