import * as Haptics from "expo-haptics";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  Keyboard,
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

interface TrainerCardProps {
  trainerName: string;
  trainerRegion: string;
  isRegionPickerOpen: boolean;
  onNameChange: (name: string) => void;
  onRegionToggle: () => void;
  onRegionSelect: (region: string) => void;
  theme: (typeof import("../../constants/colours").Colours)["light"];
}

function TrainerCard({
  trainerName,
  trainerRegion,
  isRegionPickerOpen,
  onNameChange,
  onRegionToggle,
  onRegionSelect,
  theme,
}: TrainerCardProps) {
  return (
    <View style={[styles.trainerCard, { backgroundColor: theme.uiBackground }]}>
      {/* Card label */}
      <View style={styles.trainerCardHeader}>
        <MaterialIcons name="person" size={16} color={theme.subtext} />
        <Text style={[styles.trainerCardLabel, { color: theme.subtext }]}>
          TRAINER
        </Text>
      </View>

      {/* Name input */}
      <TextInput
        value={trainerName}
        onChangeText={onNameChange}
        placeholder="Your name"
        placeholderTextColor={theme.subtext}
        style={[
          styles.trainerNameInput,
          { color: theme.title, borderBottomColor: theme.subtext + "55" },
        ]}
        autoCapitalize="words"
        returnKeyType="done"
        selectionColor={theme.selectionColour}
        maxLength={24}
      />

      {/* Sentence line */}
      <View style={styles.trainerRegionRow}>
        <Text style={[styles.trainerOfText, { color: theme.text }]}>
          of the
        </Text>

        {/* Region pill / picker toggle */}
        <Pressable
          style={[
            styles.regionPill,
            {
              backgroundColor: theme.navBackground,
              borderColor: theme.subtext + "44",
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Keyboard.dismiss();
            onRegionToggle();
          }}
        >
          <Text style={[styles.regionPillText, { color: theme.title }]}>
            {trainerRegion}
          </Text>
          <MaterialIcons
            name={isRegionPickerOpen ? "expand-less" : "expand-more"}
            size={16}
            color={theme.subtext}
          />
        </Pressable>

        <Text style={[styles.trainerOfText, { color: theme.text }]}>
          Region.
        </Text>
      </View>

      {/* Region picker — iOS HIG inset grouped list */}
      {isRegionPickerOpen && (
        <View
          style={[
            styles.regionList,
            {
              backgroundColor: theme.navBackground,
              borderColor: theme.subtext + "22",
            },
          ]}
        >
          {REGIONS.map((region, index) => {
            const isSelected = region === trainerRegion;
            const isLast = index === REGIONS.length - 1;
            return (
              <Pressable
                key={region}
                onPress={() => {
                  Haptics.selectionAsync();
                  onRegionSelect(region);
                }}
                style={({ pressed }) => [
                  styles.regionListRow,
                  !isLast && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.subtext + "33",
                  },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.regionListRowText,
                    { color: isSelected ? theme.iconColorFocused : theme.text },
                  ]}
                >
                  {region}
                </Text>
                {isSelected && (
                  <MaterialIcons
                    name="check"
                    size={18}
                    color={theme.iconColorFocused}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const STORAGE_KEYS = {
  PARTNER_POKEMON: "@partner_pokemon",
  SHINY_PREFERENCE: "@shiny_preference",
  TRAINER_NAME: "@trainer_name",
  TRAINER_REGION: "@trainer_region",
};

const REGIONS = [
  "Kanto",
  "Johto",
  "Hoenn",
  "Sinnoh",
  "Unova",
  "Kalos",
  "Alola",
  "Galar",
  "Paldea",
];

export default function PartnerPokemon() {
  const [isChangeOpen, setIsChangeOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [favouriteMon, setFavouriteMon] = useState<Pokemon | null>(null);
  const [boolShowShiny, setShowStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trainerName, setTrainerName] = useState<string>("");
  const [trainerRegion, setTrainerRegion] = useState<string>("Kanto");
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState<boolean>(false);

  // Force re-render to fix color scheme detection on initial load
  const [mounted, setMounted] = useState<boolean>(false);

  const insets = useSafeAreaInsets();
  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  // useEffect to handle initial mount for color scheme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reload saved partner every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      if (mounted) {
        loadSavedPartner();
      }
    }, [mounted]),
  );

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
      const savedTrainerName = await AsyncStorage.getItem(
        STORAGE_KEYS.TRAINER_NAME,
      );
      const savedTrainerRegion = await AsyncStorage.getItem(
        STORAGE_KEYS.TRAINER_REGION,
      );

      if (savedPokemon) {
        const pokemon: Pokemon = JSON.parse(savedPokemon);
        setFavouriteMon(pokemon);
      }

      if (savedShiny !== null) {
        setShowStatus(savedShiny === "true");
      }

      if (savedTrainerName !== null) {
        setTrainerName(savedTrainerName);
      }

      if (savedTrainerRegion !== null) {
        setTrainerRegion(savedTrainerRegion);
      }
    } catch (e) {
      console.log("Error loading saved partner:", e);
    }
  }

  async function saveTrainerName(name: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINER_NAME, name);
    } catch (e) {
      console.log("Error saving trainer name:", e);
    }
  }

  async function saveTrainerRegion(region: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINER_REGION, region);
    } catch (e) {
      console.log("Error saving trainer region:", e);
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

  const handleTrainerNameChange = (name: string) => {
    setTrainerName(name);
    saveTrainerName(name);
  };

  const handleTrainerRegionChange = (region: string) => {
    setTrainerRegion(region);
    setIsRegionPickerOpen(false);
    saveTrainerRegion(region);
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setSelectedName(query.trim());
    setQuery("");
  };

  const handleClearSearch = () => {
    setQuery("");
  };

  return (
    <>
      <Head
        title="My Partner Pokémon"
        description="Choose and view your partner Pokémon"
      />
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: theme.background, flex: 1 }}
      >
        {!favouriteMon ? (
          <ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={
              Platform.OS !== "web" ? Keyboard.dismiss : undefined
            }
            contentContainerStyle={{
              gap: 20,
              padding: 16,
              paddingBottom: insets.bottom + 16,
            }}
          >
            {/* Trainer Card */}
            <TrainerCard
              trainerName={trainerName}
              trainerRegion={trainerRegion}
              isRegionPickerOpen={isRegionPickerOpen}
              onNameChange={handleTrainerNameChange}
              onRegionToggle={() => setIsRegionPickerOpen((prev) => !prev)}
              onRegionSelect={handleTrainerRegionChange}
              theme={theme}
            />

            {/* Choose Partner Dropdown */}
            <View
              style={[
                styles.changeDropdown,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              {/* Dropdown Header / Toggle */}
              <Pressable
                style={styles.changeDropdownHeader}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsChangeOpen((prev) => !prev);
                  setQuery("");
                }}
              >
                <View style={styles.changeSectionHeader}>
                  <MaterialIcons
                    name="catching-pokemon"
                    size={20}
                    color={theme.iconColorFocused}
                  />
                  <Text style={[styles.changeTitle, { color: theme.title }]}>
                    Choose Your Partner
                  </Text>
                </View>
                <MaterialIcons
                  name={isChangeOpen ? "expand-less" : "expand-more"}
                  size={24}
                  color={theme.subtext}
                />
              </Pressable>

              {/* Dropdown Body */}
              {isChangeOpen && (
                <View style={styles.changeDropdownBody}>
                  {/* Search Bar */}
                  <View
                    style={[
                      styles.searchBarContainer,
                      { backgroundColor: theme.navBackground },
                    ]}
                  >
                    <MaterialIcons
                      name="search"
                      size={18}
                      color={theme.subtext}
                      style={styles.searchIcon}
                    />
                    <TextInput
                      placeholder="Name or Pokédex #"
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
                        <MaterialIcons
                          name="cancel"
                          size={18}
                          color={theme.subtext}
                        />
                      </Pressable>
                    )}
                  </View>

                  {/* Search Button */}
                  {query.length > 0 && (
                    <Pressable
                      style={[
                        styles.searchButton,
                        { backgroundColor: theme.buttonBackground },
                      ]}
                      onPress={handleSearch}
                    >
                      <MaterialIcons
                        name="search"
                        size={18}
                        color={theme.text}
                      />
                      <Text
                        style={[styles.searchButtonText, { color: theme.text }]}
                      >
                        Choose Partner
                      </Text>
                    </Pressable>
                  )}

                  {/* Popular choices */}
                  <Text
                    style={[styles.changeSubtitle, { color: theme.subtext }]}
                  >
                    Popular choices
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
                            Haptics.selectionAsync();
                            setQuery(example);
                            setSelectedName(example);
                            setIsChangeOpen(false);
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
              )}
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={
              Platform.OS !== "web" ? Keyboard.dismiss : undefined
            }
            contentContainerStyle={{
              gap: 16,
              padding: 16,
              paddingBottom: insets.bottom + 16,
            }}
          >
            {/* Trainer Card */}
            <TrainerCard
              trainerName={trainerName}
              trainerRegion={trainerRegion}
              isRegionPickerOpen={isRegionPickerOpen}
              onNameChange={handleTrainerNameChange}
              onRegionToggle={() => setIsRegionPickerOpen((prev) => !prev)}
              onRegionSelect={handleTrainerRegionChange}
              theme={theme}
            />

            {/* Loading indicator */}
            {isLoading && (
              <MaterialIcons
                name="hourglass-empty"
                size={20}
                color={theme.subtext}
              />
            )}

            {/* Partner Pokemon Card */}
            <Link
              href={{
                pathname: "/statistics",
                params: { name: favouriteMon.name },
              }}
              onPress={() =>
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }
              style={[
                styles.pokemonCard,
                {
                  backgroundColor:
                    bgColourByType[favouriteMon.types[0].type.name] + 70,
                  width: "100%",
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
                  <MaterialIcons
                    name="favorite"
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
                    <MaterialIcons
                      name={boolShowShiny ? "auto-awesome" : "image"}
                      size={18}
                      color={theme.title}
                    />
                    <Text style={[styles.shinyLabel, { color: theme.title }]}>
                      {boolShowShiny ? "Shiny" : "Normal"}
                    </Text>
                  </View>
                  <Switch
                    value={boolShowShiny}
                    onValueChange={(next: boolean) => {
                      Haptics.selectionAsync();
                      setShowStatus(next);
                    }}
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
            </Link>

            {/* Change Partner Dropdown — "Change Your Partner" variant */}
            <View
              style={[
                styles.changeDropdown,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              {/* Dropdown Header / Toggle */}
              <Pressable
                style={styles.changeDropdownHeader}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsChangeOpen((prev) => !prev);
                  setQuery("");
                }}
              >
                <View style={styles.changeSectionHeader}>
                  <MaterialIcons
                    name="swap-vert"
                    size={20}
                    color={theme.iconColorFocused}
                  />
                  <Text style={[styles.changeTitle, { color: theme.title }]}>
                    Change Your Partner
                  </Text>
                </View>
                <MaterialIcons
                  name={isChangeOpen ? "expand-less" : "expand-more"}
                  size={24}
                  color={theme.subtext}
                />
              </Pressable>

              {/* Dropdown Body */}
              {isChangeOpen && (
                <View style={styles.changeDropdownBody}>
                  {/* Search Bar */}
                  <View
                    style={[
                      styles.searchBarContainer,
                      { backgroundColor: theme.navBackground },
                    ]}
                  >
                    <MaterialIcons
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
                        <MaterialIcons
                          name="cancel"
                          size={18}
                          color={theme.subtext}
                        />
                      </Pressable>
                    )}
                  </View>

                  {/* Search Button */}
                  {query.length > 0 && (
                    <Pressable
                      style={[
                        styles.searchButton,
                        { backgroundColor: theme.buttonBackground },
                      ]}
                      onPress={handleSearch}
                    >
                      <MaterialIcons
                        name="search"
                        size={18}
                        color={theme.text}
                      />
                      <Text
                        style={[styles.searchButtonText, { color: theme.text }]}
                      >
                        Change Partner
                      </Text>
                    </Pressable>
                  )}

                  {/* Recommendations */}
                  <Text
                    style={[styles.changeSubtitle, { color: theme.subtext }]}
                  >
                    Popular choices
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
                            Haptics.selectionAsync();
                            setQuery(example);
                            setSelectedName(example);
                            setIsChangeOpen(false);
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
              )}
            </View>
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

  pokemonCard: {
    borderRadius: 16,
    padding: 20,
    gap: 0,
  },

  pokemonCardContent: {
    gap: 12,
    width: "100%",
  },

  nameSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
    marginBottom: 8,
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
    paddingVertical: 4,
    marginBottom: 4,
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
    paddingVertical: 24,
  },

  pokemonImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
  },

  changeDropdown: {
    borderRadius: 12,
    overflow: "hidden",
  },

  changeDropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },

  changeDropdownBody: {
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
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

  // ── Trainer Card ──────────────────────────────────────────────────────────

  trainerCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },

  trainerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  trainerCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  trainerNameInput: {
    fontSize: 28,
    fontWeight: "700",
    borderBottomWidth: 1,
    paddingBottom: 4,
    paddingHorizontal: 0,
  },

  trainerRegionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  trainerOfText: {
    fontSize: 15,
    fontWeight: "500",
  },

  regionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  regionPillText: {
    fontSize: 15,
    fontWeight: "700",
  },

  regionList: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },

  regionListRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  regionListRowText: {
    fontSize: 16,
    fontWeight: "400",
  },
});
