import { useEffect, useState } from "react";
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";

interface Pokemon {
  pokedex: number;
  name: string;
  imageFrontLink: string;
  imageBackLink: string;
  imageFrontShinyLink: string;
}

export default function Search() {
    const [query, setQuery] = useState<string>(""); // user input field
    const [selectedName, setSelectedName] = useState<string | null>(null); // becomes non-null after submitting an answer
    const [pokemonName, setPokemonName] = useState<string | null>(null);

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

                setPokemonName(jsonData.name)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    return (
        !pokemonName ?
        (<ScrollView 
        contentContainerStyle={{ gap: 10, padding: 10 }}>
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
                    accessibilityLabel="Search for a Pokémon." 
                    onPress={() => {
                        if (!query.trim()) return;
                        setSelectedName(query.trim());
                        setQuery("")
                    }}/>
            </View>
        </ScrollView>) :
        (<ScrollView contentContainerStyle={{ gap: 10, padding: 10 }}>
            <View style={styles.container}>
            <Text style={styles.question}>{pokemonName.toLocaleUpperCase()}</Text>
            <Text style={styles.question}>{"Search for a new Pokémon?"}</Text>
            <TextInput 
                placeholder="Name or national pokedex number (e.g. pikachu or 25)"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"/>
            <Button                    
                key={"enter"} 
                title="Enter"
                accessibilityLabel="Search for a Pokémon." 
                onPress={() => {
                    if (!query.trim()) return;
                    setSelectedName(query.trim());
                    setQuery("")
                }}/>
            </View>    
        </ScrollView>)
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center", 
        width: "100%",
        gap: 8
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
    }
})