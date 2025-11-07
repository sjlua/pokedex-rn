import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: "#b60c0cff", 
      tabBarStyle: { position: 'absolute' }, 

      tabBarBackground: () => (
        // see https://docs.expo.dev/versions/latest/sdk/blur-view/#experimentalblurmethod
        // on why experimentalBlurMethod="dimezisBlurView" is used
        <BlurView tint="prominent" intensity={80} style={StyleSheet.absoluteFill} experimentalBlurMethod="dimezisBlurView" />
      ),
      headerBackground: () => (
          <BlurView tint="prominent" intensity={80} style={StyleSheet.absoluteFill} experimentalBlurMethod="dimezisBlurView" />
        )
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Pokédex RN",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pokeball" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="partnerPokemon"
        options={{
          title: "My Partner",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite-border" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="info"
        options={{
          title: "App Info",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info-outline" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}