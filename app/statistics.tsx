import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colours } from "../constants/colours";

interface Pokemon {
  pokedex: number;
  name: string;
  weight: number;
  height: number;
  experience: number;
  imageFrontLink: string;
  imageBackLink: string;
  imageFrontShinyLink: string;
  types: PokemonTypeObject[];
  abilities: PokemonAbilityObject[];
  stats: PokemonStats;
}

interface PokemonTypeObject {
  type: {
    name: string;
  };
}

interface PokemonAbilityObject {
  ability: {
    name: string;
  };
}

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
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

const bgColourByTypeDark: Record<string, string> = {
  normal: "#5C5947",
  fire: "#8B5A3C",
  water: "#3D6B8F",
  electric: "#8B7B3D",
  grass: "#4B7A45",
  ice: "#5B7A7F",
  fighting: "#7A4A3D",
  poison: "#6B4F7A",
  ground: "#7A6B45",
  flying: "#6B5B8F",
  psychic: "#8F4B5B",
  bug: "#6B7A45",
  rock: "#7A6B47",
  ghost: "#6B5F7F",
  dragon: "#5B4B8F",
  dark: "#6B5A4B",
  steel: "#6B6B7A",
  fairy: "#8F5B75",
};

const typeAccentColour: Record<string, string> = {
  normal: "#6D6D4E",
  fire: "#C24A00",
  water: "#1565C0",
  electric: "#B8860B",
  grass: "#2E7D32",
  ice: "#00838F",
  fighting: "#B71C1C",
  poison: "#6A1B9A",
  ground: "#8D6E00",
  flying: "#4527A0",
  psychic: "#C62828",
  bug: "#558B2F",
  rock: "#6D4C41",
  ghost: "#4A148C",
  dragon: "#1A237E",
  dark: "#37474F",
  steel: "#455A64",
  fairy: "#880E4F",
};

const statBarColour: Record<string, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  spAtk: "#9DB7F5",
  spDef: "#A7DB8D",
  speed: "#FA92B2",
};

export default function Statistics() {
  const params = useLocalSearchParams<{ name: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [slideAnim] = useState(new Animated.Value(50));
  const [mounted, setMounted] = useState<boolean>(false);
  const colourScheme: "light" | "dark" =
    useColorScheme() === "dark" ? "dark" : "light";
  const theme = Colours[colourScheme];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPokemonByName(params.name);
    }
  }, [params.name, mounted]);

  useEffect(() => {
    if (mounted && Platform.OS === "web") {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [mounted]);

  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  async function fetchPokemonByName(name: string) {
    try {
      const unformattedResponse = await fetch(
        "https://pokeapi.co/api/v2/pokemon/" + name,
      );
      const jsonData = await unformattedResponse.json();

      const mapJsonToPokemon: Pokemon = {
        pokedex: jsonData.id,
        weight: jsonData.weight,
        height: jsonData.height,
        experience: jsonData.base_experience,
        name: jsonData.name,
        imageFrontLink: jsonData.sprites.front_default,
        imageBackLink: jsonData.sprites.back_default,
        imageFrontShinyLink: jsonData.sprites.front_shiny,
        types: jsonData.types,
        abilities: jsonData.abilities,
        stats: {
          hp: jsonData.stats[0].base_stat,
          attack: jsonData.stats[1].base_stat,
          defense: jsonData.stats[2].base_stat,
          spAtk: jsonData.stats[3].base_stat,
          spDef: jsonData.stats[4].base_stat,
          speed: jsonData.stats[5].base_stat,
        },
      };

      setPokemon(mapJsonToPokemon);

      const type = mapJsonToPokemon.types[0].type.name;
      const bg = isDark
        ? bgColourByTypeDark[type]
        : (bgColourByType[type] ?? "#A8A77A") + "70";
      const tint = isDark ? "#ffffff" : (typeAccentColour[type] ?? "#333");

      navigation.setOptions({
        title:
          mapJsonToPokemon.name.charAt(0).toUpperCase() +
          mapJsonToPokemon.name.slice(1),
        headerStyle: { backgroundColor: bg },
        headerTintColor: tint,
        contentStyle: { backgroundColor: bg },
      });
    } catch (e) {
      console.log(e);
    }
  }

  const isDark = colourScheme === "dark";
  const primaryType = pokemon?.types[0].type.name ?? "normal";
  const headerBg = isDark
    ? bgColourByTypeDark[primaryType]
    : (bgColourByType[primaryType] ?? "#A8A77A") + "70";
  const accentColour = typeAccentColour[primaryType] ?? "#333";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
  const subtleBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

  function SectionCard({
    icon,
    title,
    children,
  }: {
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIconContainer,
              { backgroundColor: accentColour + "22" },
            ]}
          >
            <MaterialIcons name={icon} size={18} color={accentColour} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.title }]}>
            {title}
          </Text>
        </View>
        {children}
      </View>
    );
  }

  const scrollViewContent = (
    <ScrollView
      style={{ backgroundColor: pokemon ? headerBg : theme.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        pokemon
          ? { backgroundColor: headerBg }
          : { backgroundColor: theme.background },
        { paddingBottom: insets.bottom + 16 },
      ]}
    >
      {!pokemon ? (
        <View style={styles.loadingContainer}>
          <MaterialIcons
            name="catching-pokemon"
            size={48}
            color={theme.subtext}
          />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>
            Loading data...
          </Text>
        </View>
      ) : (
        <View key={pokemon.name} style={styles.card}>
          {/* ── Hero Section ── */}
          <View style={styles.heroSection}>
            <View style={styles.typesRow}>
              {pokemon.types.map((t) => (
                <View
                  key={pokemon.name + t.type.name}
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: isDark
                        ? "rgba(0,0,0,0.35)"
                        : "rgba(255,255,255,0.55)",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      { color: isDark ? theme.subtext : accentColour },
                    ]}
                  >
                    {t.type.name.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.spritesRow}>
              <View style={styles.spriteWrapper}>
                <Image
                  source={{ uri: pokemon.imageFrontLink }}
                  style={styles.image}
                />
                <View
                  style={[styles.spriteLabel, { backgroundColor: subtleBg }]}
                >
                  <MaterialIcons
                    name="catching-pokemon"
                    size={12}
                    color={theme.subtext}
                  />
                  <Text
                    style={[styles.spriteLabelText, { color: theme.subtext }]}
                  >
                    Default
                  </Text>
                </View>
              </View>

              <View style={styles.spriteWrapper}>
                <Image
                  source={{ uri: pokemon.imageFrontShinyLink }}
                  style={styles.image}
                />
                <View
                  style={[styles.spriteLabel, { backgroundColor: subtleBg }]}
                >
                  <MaterialIcons
                    name="auto-awesome"
                    size={12}
                    color="#F5C400"
                  />
                  <Text
                    style={[styles.spriteLabelText, { color: theme.subtext }]}
                  >
                    Shiny
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Pokédex Info ── */}
          <SectionCard icon="menu-book" title="Pokédex Info">
            <View style={styles.infoGrid}>
              <View style={[styles.infoTile, { backgroundColor: subtleBg }]}>
                <MaterialIcons name="tag" size={20} color={accentColour} />
                <Text style={[styles.infoTileValue, { color: theme.title }]}>
                  #{pokemon.pokedex}
                </Text>
                <Text style={[styles.infoTileLabel, { color: theme.subtext }]}>
                  National Dex
                </Text>
              </View>
              <View style={[styles.infoTile, { backgroundColor: subtleBg }]}>
                <MaterialIcons
                  name="star-border"
                  size={20}
                  color={accentColour}
                />
                <Text style={[styles.infoTileValue, { color: theme.title }]}>
                  {pokemon.experience}
                </Text>
                <Text style={[styles.infoTileLabel, { color: theme.subtext }]}>
                  Base XP
                </Text>
              </View>
            </View>
          </SectionCard>

          {/* ── Physical Stats ── */}
          <SectionCard icon="straighten" title="Physical Stats">
            <View style={styles.infoGrid}>
              <View style={[styles.infoTile, { backgroundColor: subtleBg }]}>
                <MaterialIcons name="height" size={20} color={accentColour} />
                <Text style={[styles.infoTileValue, { color: theme.title }]}>
                  {(pokemon.height / 10).toFixed(1)}
                  <Text style={[styles.infoTileUnit, { color: theme.subtext }]}>
                    {" "}
                    m
                  </Text>
                </Text>
                <Text style={[styles.infoTileLabel, { color: theme.subtext }]}>
                  Height
                </Text>
              </View>
              <View style={[styles.infoTile, { backgroundColor: subtleBg }]}>
                <MaterialIcons
                  name="monitor-weight"
                  size={20}
                  color={accentColour}
                />
                <Text style={[styles.infoTileValue, { color: theme.title }]}>
                  {(pokemon.weight / 10).toFixed(1)}
                  <Text style={[styles.infoTileUnit, { color: theme.subtext }]}>
                    {" "}
                    kg
                  </Text>
                </Text>
                <Text style={[styles.infoTileLabel, { color: theme.subtext }]}>
                  Weight
                </Text>
              </View>
            </View>
          </SectionCard>

          {/* ── Base Stats ── */}
          <SectionCard icon="bar-chart" title="Base Stats">
            {(
              [
                { label: "HP", key: "hp", value: pokemon.stats.hp },
                { label: "Attack", key: "attack", value: pokemon.stats.attack },
                {
                  label: "Defense",
                  key: "defense",
                  value: pokemon.stats.defense,
                },
                { label: "Sp. Atk", key: "spAtk", value: pokemon.stats.spAtk },
                { label: "Sp. Def", key: "spDef", value: pokemon.stats.spDef },
                { label: "Speed", key: "speed", value: pokemon.stats.speed },
              ] as { label: string; key: string; value: number }[]
            ).map((stat) => (
              <View key={stat.label} style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>
                  {stat.label}
                </Text>
                <View
                  style={[
                    styles.statBarTrack,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.08)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statBarFill,
                      {
                        width: `${Math.min((stat.value / 255) * 100, 100)}%`,
                        backgroundColor:
                          statBarColour[stat.key] ?? accentColour,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.statValue, { color: theme.title }]}>
                  {stat.value}
                </Text>
              </View>
            ))}

            <View style={[styles.statTotalRow, { borderTopColor: cardBorder }]}>
              <Text style={[styles.statTotalLabel, { color: theme.subtext }]}>
                Total
              </Text>
              <Text style={[styles.statTotalValue, { color: accentColour }]}>
                {pokemon.stats.hp +
                  pokemon.stats.attack +
                  pokemon.stats.defense +
                  pokemon.stats.spAtk +
                  pokemon.stats.spDef +
                  pokemon.stats.speed}
              </Text>
            </View>
          </SectionCard>

          {/* ── Abilities ── */}
          <SectionCard icon="psychology" title="Abilities">
            <View style={styles.abilitiesGrid}>
              {pokemon.abilities.map((a) => (
                <View
                  key={pokemon.name + a.ability.name}
                  style={[
                    styles.abilityPill,
                    { backgroundColor: subtleBg, borderColor: cardBorder },
                  ]}
                >
                  <MaterialIcons name="bolt" size={16} color={accentColour} />
                  <Text style={[styles.abilityText, { color: theme.text }]}>
                    {a.ability.name
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {/* ── External Link ── */}
          <Pressable
            style={({ pressed }) => [
              styles.dbButton,
              {
                backgroundColor: accentColour,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityLabel="View more on Pokemon DB"
            onPress={() => {
              const url = `https://pokemondb.net/pokedex/${pokemon.name}`;
              Linking.openURL(url).catch((err) =>
                console.log("Failed to open URL", err),
              );
            }}
          >
            <MaterialIcons name="open-in-new" size={18} color="#fff" />
            <Text style={styles.dbButtonText}>More on PokémonDB</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );

  if (Platform.OS === "web") {
    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: pokemon ? headerBg : theme.background,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: pokemon ? headerBg : theme.background,
          }}
        >
          {scrollViewContent}
        </View>
      </Animated.View>
    );
  }

  return scrollViewContent;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
    alignItems: "center",
    width: "100%",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },

  loadingText: {
    fontSize: 16,
  },

  card: {
    width: "100%",
    alignSelf: "center",
    gap: 12,
    maxWidth: 600,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────

  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  typesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },

  typePillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  spritesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },

  spriteWrapper: {
    alignItems: "center",
    gap: 6,
  },

  image: {
    width: 130,
    height: 130,
  },

  spriteLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  spriteLabelText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ── Section Card ─────────────────────────────────────────────────────────

  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Info Grid ─────────────────────────────────────────────────────────────

  infoGrid: {
    flexDirection: "row",
    gap: 10,
  },

  infoTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
  },

  infoTileValue: {
    fontSize: 22,
    fontWeight: "700",
  },

  infoTileUnit: {
    fontSize: 14,
    fontWeight: "400",
  },

  infoTileLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ── Stats ─────────────────────────────────────────────────────────────────

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  statLabel: {
    width: 58,
    fontSize: 13,
    fontWeight: "600",
  },

  statBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
  },

  statBarFill: {
    height: "100%",
    borderRadius: 6,
  },

  statValue: {
    width: 32,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
  },

  statTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },

  statTotalLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statTotalValue: {
    fontSize: 18,
    fontWeight: "800",
  },

  // ── Abilities ─────────────────────────────────────────────────────────────

  abilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  abilityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },

  abilityText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // ── DB Button ─────────────────────────────────────────────────────────────

  dbButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    width: "100%",
  },

  dbButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
