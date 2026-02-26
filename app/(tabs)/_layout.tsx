import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { Colours } from "../../constants/colours";

export default function TabsLayout() {
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
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
        headerTitleAlign: "center",
        tabBarActiveTintColor: theme.iconColorFocused,
        tabBarInactiveTintColor: theme.iconColor,
        tabBarStyle: { position: "absolute" },

        tabBarBackground: () => (
          // see https://docs.expo.dev/versions/latest/sdk/blur-view/#blurmethod
          // on why blurMethod="dimezisBlurView" is used
          <BlurView
            tint="prominent"
            intensity={80}
            style={StyleSheet.absoluteFill}
            blurMethod="dimezisBlurView"
          />
        ),
        // EXPERIMENTAL
        // headerBackground: () => (
        //     <BlurView tint="prominent" intensity={80} style={StyleSheet.absoluteFill} blurMethod="dimezisBlurView" />
        //   )
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dexern",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pokeball" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="partnerPokemon"
        options={{
          title: "My Partner",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite-border" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="info"
        options={{
          title: "App Info",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
