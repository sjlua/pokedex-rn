import { Picker } from "@react-native-picker/picker";
import { Text } from "@react-navigation/elements";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colours } from "../../constants/colours";

interface Pokemon {
  name: string;
  imageFrontLink: string;
  imageBackLink: string;
  types: PokemonTypeObject[];
}

interface PokemonTypeObject {
  type: {
    name: string;
    url: string;
  };
}

const bgColourByType: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#F5AC78",
  water: "#7BC0FF",
  electric: "#F7D66B",
  grass: "#9AEF89",
  ice: "#BEEAF4",
  fighting: "#E68A7A",
  poison: "#CDA0E0",
  ground: "#E4C77E",
  flying: "#C6B6FF",
  psychic: "#FF8FA3",
  bug: "#C9E078",
  rock: "#D2C17A",
  ghost: "#C7B8E6",
  dragon: "#A78BFF",
  dark: "#BFA88F",
  steel: "#D6D6E0",
  fairy: "#F4B6D9",
};

export default function Collection() {
  // view region picker button
  const [viewRegionPicker, setRegionPicker] = useState<boolean>(false);
  // region picker
  const [selectedRegion, setRegion] = useState<number>(0);

  // a list of Pokemon objects and the setter
  const [listPokemon, setPokemonData] = useState<Pokemon[]>([]);

  // tracks the number of items on screen from 0-currentPage.
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Get the colour scheme from app.json userInterfaceStyle, null fallback is light
  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  // useEffect first param runs it on first boot
  useEffect(() => {
    // Fetch Pokemon, create UI
    // The Depedency List that currentPage is in below, ensures that useEffect is called
    // whenever changes are made to whatever state variables are in the Depedency List
    fetchPokemon();
  }, [currentPage, selectedRegion]);

  async function fetchPokemon() {
    try {
      // fetch takes URL and receives a response
      // This URL, starting from the offset region, gets the first currentPage pokemon
      const unformattedResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/?limit=${currentPage}&offset=${selectedRegion}`,
      );

      // format to json
      const jsonData = await unformattedResponse.json();

      // output jsonData to terminal to understand what the api responds with
      // console.log(jsonData[0]);

      // get detailed info for each pokemon in parallel
      const getPokemonStats = await Promise.all(
        jsonData.results.map(async (pokemon: any) => {
          const response = await fetch(pokemon.url);
          const stats = await response.json();
          return {
            name: pokemon.name,
            imageFrontLink: stats.sprites.front_default, // main front sprite
            imageBackLink: stats.sprites.back_default, // main front sprite
            types: stats.types,
          };
        }),
      );

      // update listPokemon data based on the results array located within the API json data
      // setPokemonData(jsonData.results)

      // update listPokemon data based on the results from further fetch
      setPokemonData(getPokemonStats);
      // console.log(JSON.stringify(getPokemonStats[0], null, 2))

      // if fail, print err to console
    } catch (e) {
      console.log(e);
    }
  }

  // When called, add 2 more pages worth of Pokemon
  const loadMorePokemon = async () => {
    setCurrentPage(currentPage + 18);
  };

  const showRegionPicker = async () => {
    viewRegionPicker ? setRegionPicker(false) : setRegionPicker(true);
  };

  return (
    // replaces standard unscrollable view with scrollable
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={listPokemon}
          numColumns={3}
          style={{
            paddingHorizontal: 10,
            backgroundColor: theme.background,
          }}
          contentContainerStyle={{ gap: 10, margin: 10 }}
          columnWrapperStyle={{
            gap: 10,
            justifyContent: "center",
            width: "100%",
          }}
          ListHeaderComponent={
            <>
              <View
                style={[
                  styles.questionRow,
                  { backgroundColor: theme.background },
                ]}
              >
                <Text style={[styles.question, { color: theme.text }]}>
                  {"Fly to another region?"}
                </Text>
                <Button
                  title={viewRegionPicker ? "Close" : "Select"}
                  color={
                    Platform.OS === "ios"
                      ? theme.iconColorFocused
                      : theme.buttonBackground
                  }
                  onPress={() => showRegionPicker()}
                />
              </View>

              {viewRegionPicker ? (
                <View style={{ backgroundColor: theme.background }}>
                  <Text style={[styles.smallQuestion, { color: theme.text }]}>
                    {
                      "By flying to another region, you can see all the Pokémon in that region, and beyond."
                    }
                  </Text>
                  <Picker
                    style={{ color: theme.text }}
                    selectedValue={selectedRegion}
                    onValueChange={(itemValue, _) => {
                      setRegion(itemValue);
                      setCurrentPage(0);
                    }}
                  >
                    <Picker.Item label="Kanto" value="0" />
                    <Picker.Item label="Johto" value="151" />
                    <Picker.Item label="Hoenn" value="251" />
                    <Picker.Item label="Sinnoh" value="386" />
                    <Picker.Item label="Unova" value="493" />
                    <Picker.Item label="Kalos" value="649" />
                    <Picker.Item label="Alola" value="721" />
                    <Picker.Item label="Galar" value="809" />
                    <Picker.Item label="Paldea" value="905" />
                  </Picker>
                </View>
              ) : null}
            </>
          }
          onEndReached={loadMorePokemon}
          onEndReachedThreshold={0.2}
          renderItem={({ item }) => (
            <Link
              key={item.name}
              href={{ pathname: "/statistics", params: { name: item.name } }}
              style={[
                styles.cardLayout,
                {
                  // + 70 makes the opacity 70%
                  // ignore type warning
                  // @ts-ignore
                  backgroundColor: bgColourByType[item.types[0].type.name] + 70,
                },
              ]}
            >
              {/* for each pokemon, create a View with the key of pokemon.name, containing it's name ... */}
              <View style={styles.cardContent}>
                {/* Name */}
                <Text
                  key={item.name}
                  style={[styles.name, { color: theme.title }]}
                >
                  {item.name.toUpperCase()}
                </Text>

                {/* Types */}
                <View style={styles.typesRow}>
                  {item.types.map((type) => (
                    <Text
                      key={item.name + type.type.name}
                      style={[styles.type, { color: theme.subtext }]}
                    >
                      {type.type.name}
                    </Text>
                  ))}
                </View>

                {/* Sprites */}
                <View style={styles.imagesRow}>
                  <Image
                    source={{ uri: item.imageFrontLink }}
                    style={{ width: 150, height: 130 }}
                  />
                </View>
              </View>
            </Link>
          )}
          keyExtractor={(item) => item.name}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 20,
    fontWeight: "bold",
  },

  questionRow: {
    flexDirection: "row",
    width: "100%",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  smallQuestion: {
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 5,
  },

  cardLayout: {
    width: "33%",
    padding: 8,
    borderRadius: 10,
  },

  cardContent: {
    width: "100%", // needed to allow centring to take up full width and actually be centred
    alignItems: "center", // center content horizontally and vertically inside each card
  },

  name: {
    fontSize: 14,
    fontWeight: "bold",
  },

  type: {
    fontSize: 14,
    fontStyle: "italic",
  },

  typesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
