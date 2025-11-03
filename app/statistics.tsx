import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";

interface Pokemon {
  pokedex: number;
  name: string;
  imageFrontLink: string;
  imageBackLink: string;
  imageFrontShinyLink: string;
  types: PokemonTypeObject[];
  abilities: PokemonAbilityObject[];
}

interface PokemonTypeObject {
  type: {
    name: string;
    url: string;
  }
}

interface PokemonAbilityObject {
  ability: {
    name: string;
    url: string;
  }
}

{/* make sure to import from react-native! */}
export default function Statistics() {
  const params = useLocalSearchParams<{ name: string }>()

  // A tuple. The array simply destructures it and gives it proper naming, rather than tuple[0], or tuple[1]
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)

  // Fetches Pokemon data on load
  useEffect(() => {
    fetchPokemonByName(params.name)
  }, [params.name])

  async function fetchPokemonByName(name: string) {
    try {
      // fetch takes URL and receives a response
      const unformattedResponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + name);
      // format to json
      const jsonData = await unformattedResponse.json();

      // console.log(JSON.stringify(jsonData, null, 2))
      const mapJsonToPokemon: Pokemon = {
        pokedex: jsonData.id,
        name: jsonData.name,
        imageFrontLink: jsonData.sprites.front_default,
        imageBackLink: jsonData.sprites.back_default,
        imageFrontShinyLink: jsonData.sprites.front_shiny,
        types: jsonData.types, // already matches your PokemonTypeObject[]
        abilities: jsonData.abilities
      }

      // set the pokemon stats
      setPokemon(mapJsonToPokemon)
    }
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
      {/* null guard against unloaded stats */}
      {!pokemon ? (
        <Text>{"Loading data..."}</Text>
      ) : (
        <View key={pokemon.name}>
          <Text style={styles.name}>{pokemon.name.toUpperCase()}</Text>
          {pokemon.types.map((type) => (
            <Text key={pokemon.name + type.type.name} style={styles.type}>{type.type.name}</Text>
          ))}
          <Image source={{ uri: pokemon.imageFrontShinyLink }} style={{ width: 150, height: 150 }} />
          {pokemon.abilities.map((ability) => (
            <Text key={pokemon.name + ability.ability.name} style={styles.standard}>{ability.ability.name}</Text>
          ))}
          {/* open serebii in the device browser */}
          <Button
          key={pokemon.pokedex} 
          title="PokemonDB"
          accessibilityLabel="View more on Pokemon DB" 
          onPress={() => {
            const url = `https://pokemondb.net/pokedex/${pokemon.name}`;
            Linking.openURL(url).catch((err) => console.log('Failed to open URL', err));
          }}/>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 40,
    fontWeight: 'bold'
  },

  type: {
    fontSize: 28,
    fontStyle: 'italic',
    color: 'grey',
  },

  standard: {
    fontSize: 18,
  }
})