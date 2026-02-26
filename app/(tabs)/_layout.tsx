import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect, useState } from "react";
import { useColorScheme, View } from "react-native";
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
    <NativeTabs
      iconColor={{
        default: theme.iconColor,
        selected: theme.iconColorFocused,
      }}
    >
      {/* Dexern — no pokeball SF symbol exists, book.closed is the closest (like a Pokédex) */}
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
