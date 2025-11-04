// Handle navigation and animations
// options changes how the page appears

import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

// A stable tab bar layout.
export default function RootLayout() {
  return <Tabs>
    <Tabs.Screen name="index" options={{ title: "Pokédex RN", tabBarIcon: ({color, size}) => (<MaterialCommunityIcons name="pokeball" size={size} color={color} />) }}></Tabs.Screen>
    <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({color, size}) => (<MaterialIcons name="search" size={size} color={color} />) }}></Tabs.Screen>
    <Tabs.Screen name="statistics" options={{ title: "Pokémon Stats", href: null, headerBackButtonDisplayMode: "minimal" }}></Tabs.Screen>
    <Tabs.Screen name="partnerPokemon" options={{ title: "Poké Partner", tabBarIcon: ({color, size}) => (<MaterialIcons name="favorite-border" size={size} color={color} />), headerBackButtonDisplayMode: "minimal" }}></Tabs.Screen>
    <Tabs.Screen name="info" options={{ title: "App Info", tabBarIcon: ({color, size}) => (<MaterialIcons name="info-outline" size={size} color={color} />)}}></Tabs.Screen>
  </Tabs>;
}
// href null allows pages to be hidden from the tab bar


// A NativeTabs implementation of the bottom bar
// Not implemented as it breaks page navigation
// export default function RootLayout() {
//   return (
//     <NativeTabs>
//       <NativeTabs.Trigger name="index">
//         <Label>Pokedex</Label>
//         <Icon sf="book.fill" drawable="ic_library_books" />
//       </NativeTabs.Trigger>

//       <NativeTabs.Trigger name="favouritePokemon">
//         <Icon sf="heart.fill" drawable="ic_favorite" />
//         <Label>Favourites</Label>
//       </NativeTabs.Trigger>
//     </NativeTabs>
//   );
// }