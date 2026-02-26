import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  useColorScheme,
  View,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colours } from "../../constants/colours";
import Head from "../../components/Head";

const STORAGE_KEYS = {
  PARTNER_POKEMON: "@partner_pokemon",
  SHINY_PREFERENCE: "@shiny_preference",
};

interface Pokemon {
  pokedex: number | null;
  name: string;
  imageFrontLink: string;
  imageFrontShinyLink: string | null;
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

export default function Search() {
  const [query, setQuery] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedPokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isPartner, setIsPartner] = useState<boolean>(false);

  // Force re-render to fix color scheme detection on initial load
  const [mounted, setMounted] = useState<boolean>(false);

  // Check if the current search result is already the saved partner
  useEffect(() => {
    if (selectedPokemon) {
      AsyncStorage.getItem(STORAGE_KEYS.PARTNER_POKEMON).then((saved) => {
        if (saved) {
          const savedPokemon = JSON.parse(saved);
          setIsPartner(savedPokemon.name === selectedPokemon.name);
        } else {
          setIsPartner(false);
        }
      });
    } else {
      setIsPartner(false);
    }
  }, [selectedPokemon]);

  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  // useEffect to handle initial mount for color scheme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      searchPokemon();
    }
  }, [selectedName, mounted]);

  // Don't render until color scheme is properly detected
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  async function searchPokemon() {
    try {
      if (selectedName) {
        setIsSearching(true);
        const unformattedResponse = await fetch(
          "https://pokeapi.co/api/v2/pokemon/" + selectedName,
        );

        if (!unformattedResponse.ok) {
          const bodyText = await unformattedResponse.text();
          const errString = `Pokémon not found`;
          if (Platform.OS === "android") {
            ToastAndroid.show(errString, ToastAndroid.SHORT);
          } else {
            Alert.alert("Error", errString);
          }
          setIsSearching(false);
          throw new Error(
            bodyText ||
              `Request failed with status ${unformattedResponse.status}`,
          );
        }

        const jsonData = await unformattedResponse.json();

        const mapJsonToPokemon: Pokemon = {
          pokedex: jsonData.id,
          name: jsonData.name,
          imageFrontLink: jsonData.sprites.front_default,
          imageFrontShinyLink: jsonData.sprites.front_shiny,
          types: jsonData.types,
        };

        setPokemon(mapJsonToPokemon);
        setIsSearching(false);
      }
    } catch (e) {
      setIsSearching(false);
      console.log(e);
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
    setIsPartner(false);
  };

  const handleTogglePartner = async () => {
    if (!selectedPokemon) return;
    if (isPartner) {
      // Remove as partner
      await AsyncStorage.removeItem(STORAGE_KEYS.PARTNER_POKEMON);
      setIsPartner(false);
    } else {
      // Save as partner — fields match partnerPokemon's Pokemon shape exactly
      const partnerData = {
        pokedex: selectedPokemon.pokedex,
        name: selectedPokemon.name,
        imageFrontLink: selectedPokemon.imageFrontLink,
        imageFrontShinyLink: selectedPokemon.imageFrontShinyLink,
        types: selectedPokemon.types,
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.PARTNER_POKEMON,
        JSON.stringify(partnerData),
      );
      setIsPartner(true);
    }
  };

  // Choose a selectionColor that provides better contrast depending on theme.
  // In dark mode use a semi-opaque light highlight; in light mode use a subtle dark highlight.
  const selectionColor =
    colourScheme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.25)";

  return (
    <>
      <Head
        title="Search Pokémon - Dexern"
        description="Search and discover information about any Pokémon by name or Pokédex number"
      />
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: theme.background, flex: 1 }}
      >
        {!selectedPokemon ? (
          <ScrollView
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              gap: 20,
              padding: 16,
            }}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.title }]}>
                Search Pokémon
              </Text>
              <MaterialIcons
                name="language"
                size={24}
                color={theme.iconColorFocused}
              />
            </View>

            {/* Search Bar */}
            <View
              style={[
                styles.searchBarContainer,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <MaterialIcons
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
                <Pressable
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                >
                  <MaterialIcons
                    name="cancel"
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
                { backgroundColor: theme.buttonBackground },
              ]}
              onPress={handleSearch}
            >
              <MaterialIcons name="search" size={18} color={theme.text} />
              <Text style={[styles.searchButtonText, { color: theme.text }]}>
                Search
              </Text>
            </Pressable>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: theme.uiBackground },
                ]}
              >
                <MaterialIcons
                  name="info-outline"
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
                Popular Pokémon
              </Text>
              <View style={styles.examplesGrid}>
                {["pikachu", "25", "charizard", "6"].map((example) => (
                  <Pressable
                    key={example}
                    style={[
                      styles.exampleButton,
                      { backgroundColor: theme.uiBackground },
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
            }}
          >
            {/* Header with Back Button */}
            <View style={styles.resultHeader}>
              <Pressable onPress={handleNewSearch} style={styles.backButton}>
                <MaterialIcons
                  name="chevron-left"
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
                <MaterialIcons
                  name="hourglass-empty"
                  size={20}
                  color={theme.subtext}
                />
              )}
            </View>

            {/* Change Partner Section Header */}
            <View style={styles.searchSection}>
              <View style={styles.searchSectionHeader}>
                <MaterialIcons
                  name="search"
                  size={20}
                  color={theme.iconColorFocused}
                />
                <Text style={[styles.searchTitle, { color: theme.title }]}>
                  Search for a new Pokémon
                </Text>
              </View>
              <Text style={[styles.searchSubtitle, { color: theme.subtext }]}>
                Curious about another Pokémon? Search again below.
              </Text>
            </View>

            {/* Search again bar */}
            <View
              style={[
                styles.searchBarContainer,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <MaterialIcons
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
                <Pressable
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                >
                  <MaterialIcons
                    name="cancel"
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
                  { backgroundColor: theme.buttonBackground },
                ]}
                onPress={handleSearch}
              >
                <MaterialIcons name="search" size={18} color={theme.text} />
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
                {/* Pokemon Name + Favourite */}
                <View style={styles.nameSection}>
                  <Text style={[styles.pokemonName, { color: theme.title }]}>
                    {selectedPokemon.name.toLocaleUpperCase()}
                  </Text>
                  <Pressable
                    onPress={handleTogglePartner}
                    style={[
                      styles.favouriteButton,
                      {
                        backgroundColor: isPartner
                          ? "rgba(255,100,100,0.25)"
                          : "rgba(255,255,255,0.25)",
                      },
                    ]}
                    accessibilityLabel={
                      isPartner
                        ? "Remove partner Pokémon"
                        : "Set as partner Pokémon"
                    }
                  >
                    <MaterialIcons
                      name={isPartner ? "favorite" : "favorite-border"}
                      size={20}
                      color={isPartner ? "#ff4444" : theme.title}
                    />
                  </Pressable>
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
            </Link>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
  },

  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 44,
  },

  clearButton: {
    padding: 6,
    marginLeft: 4,
  },

  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },

  searchButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  infoSection: {
    marginVertical: 8,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },

  examplesSection: {
    gap: 12,
  },

  examplesTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  examplesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  exampleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
  },

  exampleButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  searchSection: {
    gap: 8,
  },

  searchSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  searchSubtitle: {
    fontSize: 14,
  },

  pokemonCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },

  pokemonCardContent: {
    gap: 12,
    width: "100%",
  },

  nameSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  favouriteButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  pokemonName: {
    fontSize: 36,
    fontWeight: "700",
  },

  typesRow: {
    flexDirection: "row",
    gap: 8,
  },

  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  typeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  pokemonImage: {
    width: 160,
    height: 160,
    alignSelf: "center",
    marginVertical: 8,
  },
});
