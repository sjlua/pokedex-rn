import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Pokedex",
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
          title: "Partner",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite-border" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="info"
        options={{
          title: "Info",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info-outline" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}