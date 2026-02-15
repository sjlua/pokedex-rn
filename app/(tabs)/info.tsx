import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  Button,
  Linking,
  Platform,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Colours } from "../../constants/colours";

export default function Info() {
  const bottomBarTabHeight = useBottomTabBarHeight();

  // Get the colour scheme from app.json userInterfaceStyle, null fallback is light
  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10,
        padding: 10,
        paddingBottom: 10 + bottomBarTabHeight,
        backgroundColor: theme.background,
      }}
    >
      <Text style={{ fontSize: 28, color: theme.text }}>
        {`This is a test project made by me to learn React, React Native and Expo.\n\nHuge thanks to pokeapi.co, without them, this wouldn't be possible at all.`}
      </Text>
      <Button
        title={"Visit pokeapi.co"}
        color={
          Platform.OS === "ios"
            ? theme.iconColorFocused
            : theme.buttonBackground
        }
        onPress={() => {
          const url = `https://pokeapi.co`;
          Linking.openURL(url).catch((err) =>
            console.log("Failed to open URL", err),
          );
        }}
      ></Button>
      <View style={{ marginTop: "auto" }}>
        <Text style={{ fontSize: 14, color: theme.title }}>
          {`Trainer Sean`}
        </Text>
      </View>
    </View>
  );
}
