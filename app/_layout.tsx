import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import ExpoHead from "expo-router/head";
import { useEffect, useState } from "react";
import { Platform, StatusBar, useColorScheme, View } from "react-native";
import { Colours } from "../constants/colours";
import Head from "../components/Head";

const PWAHead = () => {
  if (Platform.OS !== "web") return null;
  return (
    <ExpoHead>
      <link rel="manifest" href="/dexern/manifest.json" />
      <link rel="apple-touch-icon" href="/dexern/apple-touch-icon.png" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Dexern" />
    </ExpoHead>
  );
};

export default function RootLayout() {
  // Force re-render to fix color scheme detection on initial load
  const [mounted, setMounted] = useState<boolean>(false);

  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  // useEffect to handle initial mount for color scheme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until color scheme is properly detected
  if (!mounted) {
    return (
      <>
        <PWAHead />
        <StatusBar
          barStyle={colourScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />
        <View style={{ flex: 1, backgroundColor: theme.background }} />
      </>
    );
  }

  return (
    <>
      <PWAHead />
      <Head
        title="Dexern - Your Pokédex Companion"
        description="A comprehensive Pokédex app to explore and track your favorite Pokémon"
      />
      <StatusBar
        barStyle={colourScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <Stack>
        {/* Tabs navigator */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }} // otherwise there'll be a (tabs) header
        />

        {/* Modal screen */}
        <Stack.Screen
          name="statistics"
          options={{
            title: "Statistics",
            presentation: "formSheet", // Use presentation directly here
            headerTintColor: theme.title,
            headerStyle: { backgroundColor: theme.navBackground },
            contentStyle: {
              backgroundColor: isLiquidGlassAvailable()
                ? "transparent"
                : theme.background,
            },
          }}
        />
      </Stack>
    </>
  );
}
