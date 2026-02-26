import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect, useState } from "react";
import { Platform, useColorScheme, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colours } from "../../constants/colours";

export default function TabsLayout() {
  const [mounted, setMounted] = useState<boolean>(false);

  const colourScheme: "light" | "dark" =
    useColorScheme() === "dark" ? "dark" : "light";
  const theme = Colours[colourScheme];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (Platform.OS === "web") {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
          tabBarStyle: { backgroundColor: theme.navBackground },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dexern",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="menu-book" size={size} color={color} />
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
              <MaterialIcons name="favorite" size={size} color={color} />
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

  return (
    <NativeTabs
      iconColor={{
        default: theme.iconColor,
        selected: theme.iconColorFocused,
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "book.closed", selected: "book.closed.fill" }}
          md="menu_book"
        />
        <NativeTabs.Trigger.Label>Dexern</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon
          sf={{ default: "magnifyingglass", selected: "magnifyingglass" }}
          md="search"
        />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="partnerPokemon">
        <NativeTabs.Trigger.Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          md="favorite"
        />
        <NativeTabs.Trigger.Label>My Partner</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="info">
        <NativeTabs.Trigger.Icon
          sf={{ default: "info.circle", selected: "info.circle.fill" }}
          md="info_outline"
        />
        <NativeTabs.Trigger.Label>App Info</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
