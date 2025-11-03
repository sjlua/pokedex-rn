import { useEffect, useState } from "react";
import { Button, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

interface Pokemon {
  pokedex: number;
  name: string;
  imageFrontLink: string;
  imageFrontShinyLink: string;
}

export default function Profile() {
    const [query, setQuery] = useState<string>(""); // user input field
    const [selectedName, setSelectedName] = useState<string | null>(null); // becomes non-null after submitting an answer
    const [favouriteMon, setFavouriteMon] = useState<Pokemon | null>(null)

    useEffect(() => { getFavouritePokemonStats() }, [selectedName])

    async function getFavouritePokemonStats() {
        try {
            if (selectedName) {
                // fetch takes URL and receives a response
                const unformattedResponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + selectedName);
                // format to json
                const jsonData = await unformattedResponse.json();

                const mapToFavourite: Pokemon = {
                    pokedex: jsonData.id,
                    name: jsonData.name,
                    imageFrontLink: jsonData.sprites.front_default,
                    imageFrontShinyLink: jsonData.sprites.front_shiny,
                }

                // update favourite pokemon stats
                setFavouriteMon(mapToFavourite)
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    return (
        <ScrollView 
        contentContainerStyle={{ gap: 20, padding: 20 }}>
            { !favouriteMon ? (
                <View style={styles.container}>
                    <Text style={styles.question}>What's your favourite Pokémon?</Text>
                    <TextInput 
                        placeholder="Name or national pokedex number (e.g. pikachu or 25)"
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"/>
                    <Button
                        key={"enter"} 
                        title="Enter"
                        accessibilityLabel="Submit your Pokémon." 
                        onPress={() => {
                            if (!query.trim()) return;
                            setSelectedName(query.trim());
                            setQuery("")
                        }}/>
                </View>
            ) : (
                <ScrollView key={favouriteMon.name} contentContainerStyle={{ gap: 20, padding: 10 }}>
                    <View style={styles.container}>
                        <Text style={styles.name}>{favouriteMon.name.toUpperCase()}</Text>
                        <Image source={{ uri: favouriteMon.imageFrontShinyLink }} style={{ width: 150, height: 150 }} />
                    </View>

                    <View style={styles.container}>
                        <Text style={styles.smallQuestion}>{"Change your favourite?"}</Text>
                        <TextInput 
                            placeholder="Name or national pokedex number (e.g. pikachu or 25)"
                            value={query}
                            onChangeText={setQuery}
                            autoCapitalize="none"/>
                        <Button                    
                            key={"enter"} 
                            title="Enter"
                            accessibilityLabel="Submit your Pokémon." 
                            onPress={() => {
                                if (!query.trim()) return;
                                setSelectedName(query.trim());
                                setQuery("")
                            }}/>
                    </View>                    
                </ScrollView>
            )}
        </ScrollView>
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