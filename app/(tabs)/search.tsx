import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Button, Image, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";

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

    useEffect(() => { searchPokemon() }, [selectedName])

    async function searchPokemon() {
        try {
            if (selectedName) {
                // fetch takes URL and receives a response
                const unformattedResponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + selectedName);
                // format to json
                const jsonData = await unformattedResponse.json();

                // handle non-2xx responses before attempting to parse JSON
                if (!unformattedResponse.ok) {
                const bodyText = await unformattedResponse.text();
                const errString = `The Pokémon you have searched for caused an error: ${bodyText.toLocaleUpperCase()}.`
                // show error message to user
                Platform.OS === 'android' ? ToastAndroid.show(errString, ToastAndroid.SHORT) : Alert.alert('Error', errString)
                // show error in console
                throw new Error(bodyText || `Request failed with status ${unformattedResponse.status}`);
                }

                const mapJsonToPokemon: Pokemon = {
                    name: jsonData.name,
                    imageFrontLink: jsonData.sprites.front_default,
                    types: jsonData.types, // already matches PokemonTypeObject[]
                }

                // set the pokemon stats
                setPokemon(mapJsonToPokemon)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    return (
        // If a pokemon hasn't been searched for, show default UI
        !selectedPokemon ?
        (<ScrollView 
        contentContainerStyle={{ gap: 10, padding: 10, paddingBottom: 10 + bottomBarTabHeight }}>
            <View style={styles.container}>
                <Text style={styles.question}>{"Search for a Pokémon"}</Text>
                <TextInput 
                    placeholder="Name or national pokedex number (e.g. pikachu or 25)"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"/>
                <Button
                    key={"search"} 
                    title="Search"
                    color={"#b60c0cff"}
                    accessibilityLabel="Search for a Pokémon." 
                    onPress={() => {
                        if (!query.trim()) return;
                        setSelectedName(query.trim());
                        setQuery("")
                    }}/>
            </View>
        </ScrollView>) :
        // Only if a Pokemon has been searched and returned successfully, return this view
        (<ScrollView contentContainerStyle={{ gap: 10, padding: 10 }}>
            <View style={styles.container}>
            <Text style={styles.question}>{"Search for a new Pokémon?"}</Text>
            <TextInput 
                placeholder="Name or national pokedex number (e.g. pikachu or 25)"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"/>
            <Button                    
                key={"enter"} 
                title="Enter"
                color={"#b60c0cff"}
                accessibilityLabel="Search for a Pokémon." 
                onPress={() => {
                    if (!query.trim()) return;
                    setSelectedName(query.trim());
                    setQuery("")
                }}/>
            </View>    

            <Link
                key={selectedPokemon.name}
                href={{ pathname: "/statistics", params: {name: selectedPokemon.name}}}
                style={[styles.cardLayout, 
                    {
                    // + 70 makes the opacity 70%
                    // ignore type warning
                    // @ts-ignore
                    backgroundColor: bgColourByType[selectedPokemon.types[0].type.name] + 70,
                    }, styles.imagesRow]}>
                    {/* for each pokemon, create a View with the key of pokemon.name, containing it's name ... */}
                    <View style={styles.cardContent}>
        
                    {/* Name */}
                    <Text style={styles.name}>
                        {selectedPokemon.name.toLocaleUpperCase()}
                    </Text>
        
                    {/* Types */}
                    <View style={styles.typesRow}>
                        {selectedPokemon.types.map((type) => (
                        <Text key={selectedPokemon.name + type.type.name} style={styles.type}>{type.type.name}</Text>
                    ))}
                    </View>
        
                    {/* Sprites */}
                    <View>
                        <Image
                        source={{uri: selectedPokemon.imageFrontLink}}
                        style={{ width: 150, height: 150 }} />
                    </View>
                    </View>
                </Link>
        </ScrollView>)
    )
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