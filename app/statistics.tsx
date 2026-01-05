import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
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

export default function Statistics() {
  // Get the string of the pokemon name from the URL params
  const params = useLocalSearchParams<{ name: string }>();

  // Get safe area insets for devices with notches, etc.
  const insets = useSafeAreaInsets();

  // A tuple. The array simply destructures it and gives it proper naming, rather than tuple[0], or tuple[1]
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  // Fetches Pokemon data on load
  useEffect(() => {
    fetchPokemonByName(params.name);
  }, [params.name]);

  // Get the colour scheme from app.json userInterfaceStyle, null fallback is light
  const colourScheme = useColorScheme() ?? "light";
  const theme = Colours[colourScheme];

  async function fetchPokemonByName(name: string) {
    try {
      // fetch takes URL and receives a response
      const unformattedResponse = await fetch(
        "https://pokeapi.co/api/v2/pokemon/" + name,
      );
      // format to json
      const jsonData = await unformattedResponse.json();

      // console.log(JSON.stringify(jsonData, null, 2))
      const mapJsonToPokemon: Pokemon = {
        pokedex: jsonData.id,
        weight: jsonData.weight,
        height: jsonData.height,
        experience: jsonData.base_experience,
        name: jsonData.name,
        imageFrontLink: jsonData.sprites.front_default,
        imageBackLink: jsonData.sprites.back_default,
        imageFrontShinyLink: jsonData.sprites.front_shiny,
        types: jsonData.types, // already matches PokemonTypeObject[]
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

      // set the pokemon stats
      setPokemon(mapJsonToPokemon);
    } catch (e) {
      console.log(e);
    }
  }
  // replaces standard unscrollable view with scrollable
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        pokemon
          ? {
              backgroundColor:
                bgColourByType[pokemon.types[0].type.name] + "70",
            }
          : {},
        { paddingBottom: insets.bottom + 64 },
      ]}
    >
      {/* null guard against unloaded stats */}
      {!pokemon ? (
        <Text style={{ color: theme.title }}>{"Loading data..."}</Text>
      ) : (
        <View key={pokemon.name} style={styles.card}>
          <View style={styles.topSection}>
            <Text style={[styles.name, { color: theme.title }]}>
              {pokemon.name.toUpperCase()}
            </Text>

            <View style={styles.imagesRow}>
              <Image
                source={{ uri: pokemon.imageFrontLink }}
                style={styles.image}
              />
              <Image
                source={{ uri: pokemon.imageFrontShinyLink }}
                style={styles.image}
              />
            </View>

            <View style={styles.typesRow}>
              {pokemon.types.map((type) => (
                <Text
                  key={pokemon.name + type.type.name}
                  style={[styles.type, { color: theme.subtext }]}
                >
                  {type.type.name}
                </Text>
              ))}
            </View>
          </View>

          {/* Pokedex stats */}
          <Text style={[styles.standardTextHeading, { color: theme.text }]}>
            Pokédex stats
          </Text>
          <Text style={[styles.standardText, { color: theme.text }]}>
            National Pokédex: {pokemon.pokedex}
          </Text>
          <Text style={[styles.standardText, { color: theme.text }]}>
            Regional Dex Number: {pokemon.pokedex}
          </Text>

          {/* Physical stats of the Pokemon */}
          <Text style={[styles.standardTextHeading, { color: theme.text }]}>
            Physical stats
          </Text>
          <Text style={[styles.standardText, { color: theme.text }]}>
            Height: {pokemon.height}
          </Text>
          <Text style={[styles.standardText, { color: theme.text }]}>
            Weight: {pokemon.weight}
          </Text>
          <Text style={[styles.standardText, { color: theme.text }]}>
            Base Experience: {pokemon.experience}
          </Text>

          {/* Base stats */}
          <Text style={[styles.standardTextHeading, { color: theme.text }]}>
            Base stats
          </Text>
          {[
            { label: "HP", value: pokemon.stats.hp },
            { label: "Attack", value: pokemon.stats.attack },
            { label: "Defense", value: pokemon.stats.defense },
            { label: "Sp. Atk", value: pokemon.stats.spAtk },
            { label: "Sp. Def", value: pokemon.stats.spDef },
            { label: "Speed", value: pokemon.stats.speed },
          ].map((stat) => (
            <View key={stat.label} style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.text }]}>
                {stat.label}
              </Text>
              <View style={styles.statBarContainer}>
                <View
                  style={[
                    styles.statBar,
                    { width: `${Math.min(stat.value / 2.55, 100)}%` },
                  ]}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stat.value}
              </Text>
            </View>
          ))}

          {/* Abilities of the pokemon */}
          <Text style={[styles.standardTextHeading, { color: theme.text }]}>
            Abilities
          </Text>
          <View>
            {pokemon.abilities.map((ability) => (
              <Text
                key={pokemon.name + ability.ability.name}
                style={[styles.standardText, { color: theme.text }]}
              >
                {ability.ability.name}
              </Text>
            ))}
          </View>

          <View style={styles.buttonWrap}>
            <Button
              key={pokemon.pokedex}
              title="More stats on PokemonDB"
              color={theme.iconColorFocused}
              accessibilityLabel="View more on Pokemon DB"
              onPress={() => {
                const url = `https://pokemondb.net/pokedex/${pokemon.name}`;
                Linking.openURL(url).catch((err) =>
                  console.log("Failed to open URL", err),
                );
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
    alignItems: "center",
    width: "100%",
  },

  card: {
    width: "100%",
    alignSelf: "center",
    gap: 8,
  },

  name: {
    fontSize: 36,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  type: {
    fontSize: 18,
    fontStyle: "italic",
    color: "grey",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  typesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  topSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
  },

  standardTextHeading: {
    fontWeight: "700",
    fontSize: 16,
  },

  standardText: {
    fontSize: 16,
  },

  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 8,
  },

  image: {
    width: 140,
    height: 140,
  },

  buttonWrap: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 8,
  },

  statLabel: {
    width: 60,
  },

  statBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },

  statBar: {
    height: "100%",
    backgroundColor: "#2991E3",
    borderRadius: 4,
  },

  statValue: {
    width: 35,
    textAlign: "right",
  },
});
