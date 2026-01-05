import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colours } from "../constants/colours";

export default function RootLayout() {
  const colourScheme = useColorScheme() ?? 'light'
  const theme = Colours[colourScheme]

  return (
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
          title: 'Statistics',
          presentation: 'formSheet', // Use presentation directly here
          headerTintColor: theme.title,
          headerStyle: {backgroundColor: theme.navBackground},
          contentStyle: {backgroundColor: isLiquidGlassAvailable() ? "transparent" : "theme.background"}
        }}
      />
    </Stack>
  );
}