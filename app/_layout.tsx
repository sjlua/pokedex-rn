import { Stack } from "expo-router";

// handle navigation and animations
// options changes how the page appears
export default function RootLayout() {
  return <Stack>
    <Stack.Screen name="index" options={{ title: "Pokedex" }}></Stack.Screen>
    <Stack.Screen name="statistics" options={{ title: "Pokemon Stats", headerBackButtonDisplayMode: "minimal" }}></Stack.Screen>
  </Stack>;
}
