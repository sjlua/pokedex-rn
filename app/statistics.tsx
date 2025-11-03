import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Statistics() {
  const params = useLocalSearchParams<{ name: string }>()

  console.log(params.name)

//   useEffect(() => {}, [])

  async function fetchPokemonByName(name: string) {
    try {}
    catch (e) {
        console.log(e)
    }
  }
  return (
    // replaces standard unscrollable view with scrollable
    <ScrollView
    contentContainerStyle={{
      gap: 20,
      padding: 20
    }}>
        {/* make sure to import from react-native! */}
        <View key={params.name}>
            <Text>
            {params.name}
            </Text>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

})