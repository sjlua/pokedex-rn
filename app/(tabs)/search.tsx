import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, Image, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, useColorScheme, View } from "react-native";
import { Colours } from "../../constants/colours";

interface Pokemon {
  name: string;
  imageFrontLink: string;
  types: PokemonTypeObject[];
}

interface PokemonTypeObject {
  type: {
    name: string;
    url: string;
  }
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
  fairy: "#F4B6D9"
}

export default function Search() {
    const bottomBarTabHeight = useBottomTabBarHeight();

    const [query, setQuery] = useState<string>(""); // user input field
    const [selectedName, setSelectedName] = useState<string | null>(null); // becomes non-null after submitting an answer
    const [selectedPokemon, setPokemon] = useState<Pokemon | null>(null);

    // Get the colour scheme from app.json userInterfaceStyle, null fallback is light
    const colourScheme = useColorScheme() ?? 'light'
    const theme = Colours[colourScheme]

    useEffect(() => { searchPokemon() }, [selectedName])

    async function searchPokemon() {
        try {
            if (selectedName) {
                // fetch takes URL and receives a response
                const unformattedResponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + selectedName);
                
                // handle non-2xx responses before attempting to parse JSON
                if (!unformattedResponse.ok) {
                const bodyText = await unformattedResponse.text();
                const errString = `The Pokémon you have searched for caused an error: ${bodyText.toUpperCase()}.`;
                // show error message to user
                Platform.OS === 'android'
                    ? ToastAndroid.show(errString, ToastAndroid.SHORT)
                    : Alert.alert('Error', errString);
                // show error in console
                throw new Error(bodyText || `Request failed with status ${unformattedResponse.status}`);
                }
                
                // format to json
                const jsonData = await unformattedResponse.json();

                const mapJsonToPokemon: Pokemon = {
                name: jsonData.name,
                imageFrontLink: jsonData.sprites.front_default,
                types: jsonData.types,
                };

                setPokemon(mapJsonToPokemon);
                setPokemon(mapJsonToPokemon)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

  const handleSearch = () => {
    if (!query.trim()) return;
    setSelectedName(query.trim());
    setQuery("");
  };

  const handleClearSearch = () => {
    setQuery("");
  };

  const handleNewSearch = () => {
    setPokemon(null);
    setSelectedName(null);
    setQuery("");
  };

  // Choose a selectionColor that provides better contrast depending on theme.
  // In dark mode use a semi-opaque light highlight; in light mode use a subtle dark highlight.
  const selectionColor =
    colourScheme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.25)";

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      {!selectedPokemon ? (
        <ScrollView
          contentContainerStyle={{
            gap: 16,
            padding: 16,
            paddingBottom: 16 + bottomBarTabHeight,
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.title }]}>
              Search Pokémon
            </Text>
            <Ionicons
              name="sparkles"
              size={24}
              color={theme.iconColorFocused}
            />
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchBarContainer,
              { backgroundColor: theme.navBackground },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={theme.subtext}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Name or Pokedex #"
              placeholderTextColor={theme.subtext}
              value={query}
              style={[styles.searchInput, { color: theme.text }]}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              returnKeyType="search"
              selectionColor={selectionColor}
            />
            {query.length > 0 && (
              <Pressable onPress={handleClearSearch} style={styles.clearButton}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={theme.subtext}
                />
              </Pressable>
            )}
          </View>

          {/* Search Button */}
          <Pressable
            style={[
              styles.searchButton,
              { backgroundColor: theme.iconColorFocused },
            ]}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={18} color={theme.text} />
            <Text style={[styles.searchButtonText, { color: theme.text }]}>
              Search
            </Text>
          </Pressable>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View
              style={[styles.infoBox, { backgroundColor: theme.navBackground }]}
            >
              <Ionicons
                name="information-circle"
                size={24}
                color={theme.iconColorFocused}
              />
              <Text style={[styles.infoText, { color: theme.text }]}>
                Search by Pokémon name or National Pokédex number
              </Text>
            </View>
          </View>

          {/* Examples */}
          <View style={styles.examplesSection}>
            <Text style={[styles.examplesTitle, { color: theme.text }]}>
              Examples
            </Text>
            <View style={styles.examplesGrid}>
              {["pikachu", "25", "charizard", "6"].map((example) => (
                <Pressable
                  key={example}
                  style={[
                    styles.exampleButton,
                    { backgroundColor: theme.navBackground },
                  ]}
                  onPress={() => {
                    setQuery(example);
                    setSelectedName(example);
                  }}
                >
                  <Text
                    style={[styles.exampleButtonText, { color: theme.text }]}
                  >
                    {example}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        // Pokemon Results View
        <ScrollView
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            gap: 16,
            padding: 16,
            paddingBottom: 16 + bottomBarTabHeight,
          }}
        >
          {/* Header with Back Button */}
          <View style={styles.resultHeader}>
            <Pressable onPress={handleNewSearch} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme.iconColorFocused}
              />
              <Text
                style={[
                  styles.backButtonText,
                  { color: theme.iconColorFocused },
                ]}
              >
                Back
              </Text>
            </Pressable>
            {isSearching && (
              <Ionicons name="hourglass" size={20} color={theme.subtext} />
            )}
          </View>

          {/* New Search Bar */}
          <View
            style={[
              styles.searchBarContainer,
              { backgroundColor: theme.navBackground },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={theme.subtext}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search another..."
              placeholderTextColor={theme.subtext}
              value={query}
              style={[styles.searchInput, { color: theme.text }]}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              returnKeyType="search"
              selectionColor={selectionColor}
            />
            {query.length > 0 && (
              <Pressable onPress={handleClearSearch} style={styles.clearButton}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={theme.subtext}
                />
              </Pressable>
            )}
          </View>

          {query.length > 0 && (
            <Pressable
              style={[
                styles.searchButton,
                { backgroundColor: theme.butt },
              ]}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={18} color={theme.text} />
              <Text style={[styles.searchButtonText, { color: theme.text }]}>
                Search
              </Text>
            </Pressable>
          )}

          {/* Pokemon Card */}
          <Link
            key={selectedPokemon.name}
            href={{
              pathname: "/statistics",
              params: { name: selectedPokemon.name },
            }}
            style={[
              styles.pokemonCard,
              {
                backgroundColor:
                  bgColourByType[selectedPokemon.types[0].type.name] + 70,
              },
            ]}
          >
            <View style={styles.pokemonCardContent}>
              {/* Pokemon Name */}
              <View style={styles.nameSection}>
                <Text style={[styles.pokemonName, { color: theme.title }]}>
                  {selectedPokemon.name.toLocaleUpperCase()}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={theme.title} />
              </View>

              {/* Types */}
              <View style={styles.typesRow}>
                {selectedPokemon.types.map((type) => (
                  <View
                    key={selectedPokemon.name + type.type.name}
                    style={[
                      styles.typeTag,
                      { backgroundColor: "rgba(255,255,255,0.3)" },
                    ]}
                  >
                    <Text style={[styles.typeText, { color: theme.subtext }]}>
                      {type.type.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Pokemon Image */}
              <Image
                source={{ uri: selectedPokemon.imageFrontLink }}
                style={styles.pokemonImage}
              />
            </View>

            {/* Tap Indicator */}
            <View style={styles.tapIndicator}>
              <Ionicons name="finger-print" size={16} color={theme.title} />
              <Text style={[styles.tapText, { color: theme.title }]}>
                Tap for details
              </Text>
            </View>
          </Link>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center", 
        width: "100%",
        gap: 8
    },

    cardLayout: {
        padding: 25,
        borderRadius: 20,
    },

    typesRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10
    },

    type: {
        fontSize: 20,
        fontStyle: 'italic',
        color: 'grey',
    },

    cardContent: {
        width: "100%", // needed to allow centring to take up full width and actually be centred
        alignItems: "center", // center content horizontally and vertically inside each card
    },

    question: {
        fontSize: 20,
        fontWeight: 'bold'
    },

    smallQuestion: {
        fontSize: 15,
        fontWeight: 'bold'
    },

    smallText: {
        fontSize: 15,
    },

    name: {
        fontSize: 40,
        fontWeight: 'bold'
    },

    imagesRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
})