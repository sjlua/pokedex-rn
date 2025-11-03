import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

// Base version from Code with Beto: https://youtu.be/BUXnASp_WyQ

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

export default function Index() {
  // a list of Pokemon objects and the setter?
  const [listPokemon, setPokemonData] = useState<Pokemon[]>([]);

  // useEffect first param runs it on first boot
  useEffect(() => {
    // fetch list of pokemon
  fetchPokemon()
  }, [])

  async function fetchPokemon() {
    try {
      // fetch takes URL and receives a response
      const unformattedResponse = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=15");

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
            types: stats.types
          }
        })
      )

      // update listPokemon data based on the results array located within the API json data
      // setPokemonData(jsonData.results)

      // update listPokemon data based on the results from further fetch
      setPokemonData(getPokemonStats)
      console.log(JSON.stringify(getPokemonStats[0], null, 2))

      // if fail, print err to console
    } catch(e) {
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
      {listPokemon.map((pokemon: Pokemon) => (
        <Link
        key={pokemon.name}
        href={{ pathname: "/statistics", params: {name: pokemon.name}}}
        style={[styles.pokemonCard, 
            {
            // + 70 makes the opacity 70%
            // ignore type warning
            // @ts-ignore
            backgroundColor: bgColourByType[pokemon.types[0].type.name] + 70,
          }]}>
           {/* for each pokemon, create a View with the key of pokemon.name, containing it's name ... */}
          <View>
            <Text key={pokemon.name} style={styles.name}>
              {pokemon.name.toUpperCase()}
            </Text>

            {pokemon.types.map((type) => (
              <Text key={pokemon.name + type.type.name} style={styles.type}>{type.type.name}</Text>
            ))}

            <View style={{
              flexDirection: "row"
            }}>
              <Image
              source={{uri: pokemon.imageFrontLink}}
              style={{ width: 150, height: 150 }} />
              <Image
              source={{uri: pokemon.imageBackLink}}
              style={{ width: 150, height: 150 }} />
            </View>
          </View>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pokemonCard: {
    padding: 20,
    borderRadius: 20,
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    // padding: 20
  },

  type: {
    fontSize: 20,
    fontStyle: 'italic',
    color: 'grey',
    // paddingStart: 20
  }
})