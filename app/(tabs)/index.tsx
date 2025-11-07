import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Image, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const bottomBarTabHeight = useBottomTabBarHeight();

  // a list of Pokemon objects and the setter?
  const [listPokemon, setPokemonData] = useState<Pokemon[]>([]);

  // tracks the number of items on screen from 0-currentPage.
  const [currentPage, setCurrentPage] = useState<number>(1)

  // useEffect first param runs it on first boot
  useEffect(() => {
    // Fetch Pokemon, create UI
    // The list that currentPage is in, ensures that useEffect is called 
    // whenever changes are made to whatever state variables are in the Depedency List
  fetchPokemon()
  }, [currentPage])

  async function fetchPokemon() {
    try {
      // fetch takes URL and receives a response
      const unformattedResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${currentPage}`);

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
      // console.log(JSON.stringify(getPokemonStats[0], null, 2))

      // if fail, print err to console
    } catch(e) {
      console.log(e)
    }
  }
  return (
    // replaces standard unscrollable view with scrollable
    <ScrollView
    contentContainerStyle={{ gap: 10, padding: 10, paddingBottom: 10 + bottomBarTabHeight }}>
      {listPokemon.map((pokemon: Pokemon) => (
        <Link
        key={pokemon.name}
        href={{ pathname: "/statistics", params: {name: pokemon.name}}}
        style={[styles.cardLayout, 
            {
            // + 70 makes the opacity 70%
            // ignore type warning
            // @ts-ignore
            backgroundColor: bgColourByType[pokemon.types[0].type.name] + 70,
          }]}>
           {/* for each pokemon, create a View with the key of pokemon.name, containing it's name ... */}
          <View style={styles.cardContent}>

            {/* Name */}
            <Text key={pokemon.name} style={styles.name}>
              {pokemon.name.toUpperCase()}
            </Text>

            {/* Types */}
            <View style={styles.typesRow}>
              {pokemon.types.map((type) => (
              <Text key={pokemon.name + type.type.name} style={styles.type}>{type.type.name}</Text>
            ))}
            </View>

            {/* Sprites */}
            <View style={styles.imagesRow}>
              <Image
              source={{uri: pokemon.imageFrontLink}}
              style={{ width: 150, height: 150 }} />
              <Image
              source={{uri: pokemon.imageBackLink}}
              style={{ width: 150, height: 150 }} />
            </View>
          </View>
        </Link>
      ))
      }
      <View style={styles.buttonRow}>
        {/* Don't allow the user to request for less pokemon than 10, since 10 is the page increment */}
        {currentPage < 10 ? null : <Button 
        title="View Less"
        color={"#b60c0cff"}
        onPress={() => {
          const updatePage: number = currentPage >= 11 ? currentPage - 10 : currentPage
          // Update current page number
          setCurrentPage(updatePage)
        }}/>}

        {/* extra view needed to allow right aligned More text */}
        <View style={{marginLeft: "auto"}}>
          <Button 
            title="View More"
            color={"#b60c0cff"}
            onPress={() => {
              const updatePage: number = currentPage + 10
              setCurrentPage(updatePage)
          }}/>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardLayout: {
    padding: 25,
    borderRadius: 20,
  },

  cardContent: {
    width: "100%", // needed to allow centring to take up full width and actually be centred
    alignItems: "center", // center content horizontally and vertically inside each card
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold'
  },

  type: {
    fontSize: 20,
    fontStyle: 'italic',
    color: 'grey',
  },

  typesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10
  },

  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  }
})