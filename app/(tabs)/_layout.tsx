import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StyleSheet, useColorScheme } from "react-native";
import { Colours } from "../../constants/colours";

export default function TabsLayout() {
  // Get the colour scheme from app.json userInterfaceStyle, null fallback is light
  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.navBackground },
        headerTintColor: theme.title,
        tabBarActiveTintColor: theme.iconColorFocused,
        tabBarInactiveTintColor: theme.iconColor,
        tabBarStyle: { position: "absolute" },

        tabBarBackground: () => (
          // see https://docs.expo.dev/versions/latest/sdk/blur-view/#experimentalblurmethod
          // on why experimentalBlurMethod="dimezisBlurView" is used
          <BlurView
            tint="prominent"
            intensity={80}
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
        ),
        // EXPERIMENTAL
        // headerBackground: () => (
        //     <BlurView tint="prominent" intensity={80} style={StyleSheet.absoluteFill} experimentalBlurMethod="dimezisBlurView" />
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
