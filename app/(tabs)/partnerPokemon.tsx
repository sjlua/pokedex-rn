import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  ToastAndroid,
  useColorScheme,
  View,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colours } from "../../constants/colours";
import Head from "../../components/Head";

interface Pokemon {
  pokedex: number;
  name: string;
  imageFrontLink: string;
  imageFrontShinyLink: string;
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

const STORAGE_KEYS = {
  PARTNER_POKEMON: "@partner_pokemon",
  SHINY_PREFERENCE: "@shiny_preference",
};

export default function PartnerPokemon() {
  const bottomBarTabHeight = useBottomTabBarHeight();

  const [query, setQuery] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [favouriteMon, setFavouriteMon] = useState<Pokemon | null>(null);
  const [boolShowShiny, setShowStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Force re-render to fix color scheme detection on initial load
  const [mounted, setMounted] = useState<boolean>(false);

  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  // useEffect to handle initial mount for color scheme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved partner Pokemon on mount
  useEffect(() => {
    if (mounted) {
      loadSavedPartner();
    }
  }, [mounted]);

  // Fetch new Pokemon when selectedName changes
  useEffect(() => {
    if (mounted) {
      getFavouritePokemonStats();
    }
  }, [selectedName, mounted]);

  // Save partner Pokemon whenever it changes
  useEffect(() => {
    if (mounted && favouriteMon) {
      saveFavouriteMon(favouriteMon);
    }
  }, [favouriteMon, mounted]);

  // Save shiny preference whenever it changes
  useEffect(() => {
    if (mounted) {
      saveShinyPreference(boolShowShiny);
    }
  }, [boolShowShiny, mounted]);

  // Don't render until color scheme is properly detected
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  async function loadSavedPartner() {
    try {
      const savedPokemon = await AsyncStorage.getItem(
        STORAGE_KEYS.PARTNER_POKEMON,
      );
      const savedShiny = await AsyncStorage.getItem(
        STORAGE_KEYS.SHINY_PREFERENCE,
      );

      if (savedPokemon) {
        const pokemon: Pokemon = JSON.parse(savedPokemon);
        setFavouriteMon(pokemon);
      }

      if (savedShiny !== null) {
        setShowStatus(savedShiny === "true");
      }
    } catch (e) {
      console.log("Error loading saved partner:", e);
    }
  }

  async function saveFavouriteMon(pokemon: Pokemon) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PARTNER_POKEMON,
        JSON.stringify(pokemon),
      );
    } catch (e) {
      console.log("Error saving partner:", e);
    }
  }

  async function saveShinyPreference(isShiny: boolean) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHINY_PREFERENCE,
        isShiny.toString(),
      );
    } catch (e) {
      console.log("Error saving shiny preference:", e);
    }
  }

  async function getFavouritePokemonStats() {
    try {
      if (selectedName) {
        setIsLoading(true);
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
          setIsLoading(false);
          throw new Error(
            bodyText ||
              `Request failed with status ${unformattedResponse.status}`,
          );
        }

        const jsonData = await unformattedResponse.json();

        const mapToFavourite: Pokemon = {
          pokedex: jsonData.id,
          name: jsonData.name,
          imageFrontLink: jsonData.sprites.front_default,
          imageFrontShinyLink: jsonData.sprites.front_shiny,
          types: jsonData.types,
        };

        setFavouriteMon(mapToFavourite);
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
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

  const handleNewPartner = async () => {
    setFavouriteMon(null);
    setSelectedName(null);
    setQuery("");
    // Clear saved partner from storage
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PARTNER_POKEMON);
    } catch (e) {
      console.log("Error clearing saved partner:", e);
    }
  };

  return (
    <>
      <Head
        title="My Partner Pokémon - Dexern"
        description="Choose and view your partner Pokémon companion"
      />
      <View style={{ backgroundColor: theme.background, flex: 1 }}>
        {!favouriteMon ? (
          <ScrollView
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              gap: 20,
              padding: 16,
              paddingBottom: 16 + bottomBarTabHeight,
            }}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.title }]}>
                Partner Pokémon
              </Text>
              <Ionicons
                name="heart-outline"
                size={28}
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
                selectionColor={theme.selectionColour}
              />
              {query.length > 0 && (
                <Pressable
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                >
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
                { backgroundColor: theme.buttonBackground },
              ]}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={18} color={theme.text} />
              <Text style={[styles.searchButtonText, { color: theme.text }]}>
                Choose Partner
              </Text>
            </Pressable>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: theme.navBackground },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={theme.iconColorFocused}
                />
                <Text style={[styles.infoText, { color: theme.text }]}>
                  Select your favorite Pokémon by name or National Pokédex
                  number
                </Text>
              </View>
            </View>

            {/* Examples */}
            <View style={styles.examplesSection}>
              <Text style={[styles.examplesTitle, { color: theme.text }]}>
                Popular Choices
              </Text>
              <View style={styles.examplesGrid}>
                {["pikachu", "charizard", "blastoise", "venusaur"].map(
                  (example) => (
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
                        style={[
                          styles.exampleButtonText,
                          { color: theme.text },
                        ]}
                      >
                        {example}
                      </Text>
                    </Pressable>
                  ),
                )}
              </View>
            </View>
          </ScrollView>
        ) : (
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
              <Pressable onPress={handleNewPartner} style={styles.backButton}>
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
              {isLoading && (
                <Ionicons name="hourglass" size={20} color={theme.subtext} />
              )}
            </View>

            {/* Partner Pokemon Card */}
            <View
              style={[
                styles.pokemonCard,
                {
                  backgroundColor:
                    bgColourByType[favouriteMon.types[0].type.name] + 70,
                },
              ]}
            >
              <View style={styles.pokemonCardContent}>
                {/* Header with name and icon */}
                <View style={styles.nameSection}>
                  <View>
                    <Text style={[styles.pokemonName, { color: theme.title }]}>
                      {favouriteMon.name.toLocaleUpperCase()}
                    </Text>
                    <Text
                      style={[styles.pokedexNumber, { color: theme.title }]}
                    >
                      #{favouriteMon.pokedex}
                    </Text>
                  </View>
                  <Ionicons
                    name="heart"
                    size={32}
                    color={theme.title}
                    style={{ opacity: 0.8 }}
                  />
                </View>

                {/* Types */}
                <View style={styles.typesRow}>
                  {favouriteMon.types.map((type) => (
                    <View
                      key={favouriteMon.name + type.type.name}
                      style={[
                        styles.typeTag,
                        { backgroundColor: "rgba(255,255,255,0.3)" },
                      ]}
                    >
                      <Text style={[styles.typeText, { color: theme.title }]}>
                        {type.type.name}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Shiny Toggle */}
                <View style={styles.shinyToggleRow}>
                  <View style={styles.shinyLabelContainer}>
                    <Ionicons
                      name={boolShowShiny ? "sparkles" : "image-outline"}
                      size={18}
                      color={theme.title}
                    />
                    <Text style={[styles.shinyLabel, { color: theme.title }]}>
                      {boolShowShiny ? "Shiny" : "Normal"}
                    </Text>
                  </View>
                  <Switch
                    value={boolShowShiny}
                    onValueChange={(next: boolean) => setShowStatus(next)}
                    accessibilityLabel="Toggle shiny form"
                  />
                </View>

                {/* Pokemon Image */}
                <View style={styles.imageContainer}>
                  {boolShowShiny ? (
                    <Image
                      source={{ uri: favouriteMon.imageFrontShinyLink }}
                      style={styles.pokemonImage}
                    />
                  ) : (
                    <Image
                      source={{ uri: favouriteMon.imageFrontLink }}
                      style={styles.pokemonImage}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Change Partner Section Header */}
            <View style={styles.changeSection}>
              <View style={styles.changeSectionHeader}>
                <Ionicons
                  name="swap-vertical"
                  size={20}
                  color={theme.iconColorFocused}
                />
                <Text style={[styles.changeTitle, { color: theme.title }]}>
                  Change Your Partner
                </Text>
              </View>
              <Text style={[styles.changeSubtitle, { color: theme.subtext }]}>
                Select a different Pokémon to be your new partner
              </Text>
            </View>

            {/* Change Partner Search Bar */}
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
                placeholder="Choose another..."
                placeholderTextColor={theme.subtext}
                value={query}
                style={[styles.searchInput, { color: theme.text }]}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                autoCapitalize="none"
                returnKeyType="search"
                selectionColor={theme.selectionColour}
              />
              {query.length > 0 && (
                <Pressable
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                >
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
                  { backgroundColor: theme.buttonBackground },
                ]}
                onPress={handleSearch}
              >
                <Ionicons name="search" size={18} color={theme.text} />
                <Text style={[styles.searchButtonText, { color: theme.text }]}>
                  Change Partner
                </Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </View>
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

  pokemonCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },

  pokemonCardContent: {
    gap: 12,
  },

  nameSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pokemonName: {
    fontSize: 36,
    fontWeight: "700",
  },

  pokedexNumber: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
    marginTop: 4,
  },

  typesRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  typeText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  shinyToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  shinyLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  shinyLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  pokemonImage: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },

  changeSection: {
    gap: 8,
  },

  changeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  changeTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  changeSubtitle: {
    fontSize: 14,
  },
});
