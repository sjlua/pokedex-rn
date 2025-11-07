import { Stack } from 'expo-router';

export default function RootLayout() {
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
          presentation: 'modal', // Use presentation directly here
        }}
      />
    </Stack>
  );
}