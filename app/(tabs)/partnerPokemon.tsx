import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { Alert, Button, Image, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, ToastAndroid, View } from "react-native";

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

export default function PartnerPokemon() {
    const bottomBarTabHeight = useBottomTabBarHeight();

    const [query, setQuery] = useState<string>(""); // user input field
    const [selectedName, setSelectedName] = useState<string | null>(null); // becomes non-null after submitting an answer
    const [favouriteMon, setFavouriteMon] = useState<Pokemon | null>(null)
    const [boolShowShiny, setShowStatus] = useState<boolean>(false); // show shiny toggle

    useEffect(() => { getFavouritePokemonStats() }, [selectedName])

    async function getFavouritePokemonStats() {
        try {
            if (selectedName) {
                // fetch takes URL and receives a response
                const unformattedResponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + selectedName);

                // handle non-2xx responses before attempting to parse JSON
                if (!unformattedResponse.ok) {
                const bodyText = await unformattedResponse.text();
                const errString = `The Pokémon you have searched for caused an error: ${bodyText.toLocaleUpperCase()}.`
                // show error message to user
                Platform.OS === 'android' ? ToastAndroid.show(errString, ToastAndroid.SHORT) : Alert.alert('Error', errString)
                // show error in console
                throw new Error(bodyText || `Request failed with status ${unformattedResponse.status}`);
                }

                // format to json
                const jsonData = await unformattedResponse.json();

                const mapToFavourite: Pokemon = {
                    pokedex: jsonData.id,
                    name: jsonData.name,
                    imageFrontLink: jsonData.sprites.front_default,
                    imageFrontShinyLink: jsonData.sprites.front_shiny,
                    types: jsonData.types, // already matches PokemonTypeObject[]
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
            contentContainerStyle={[
              { gap: 30, padding: 10, paddingBottom: 10 + bottomBarTabHeight }, 
              favouriteMon ? {backgroundColor: bgColourByType[favouriteMon.types[0].type.name] + 70} : {}
            ]}>
            { !favouriteMon ? (
                <View style={styles.container}>
                    <Text style={styles.question}>Who's your Partner Pokémon?</Text>
                    <TextInput 
                        placeholder="Name or national pokedex number (e.g. pikachu or 25)"
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"/>
                    <Button
                        key={"enter"} 
                        title="Enter"
                        color={"#b60c0cff"}
                        accessibilityLabel="Submit your Pokémon." 
                        onPress={() => {
                            if (!query.trim()) return;
                            setSelectedName(query.trim());
                            setQuery("")
                        }}/>
                </View>
            ) : (
                <ScrollView key={favouriteMon.name} contentContainerStyle={{ gap: 20, padding: 10, paddingBottom: 10 + bottomBarTabHeight }}>
                    <View style={styles.container}>
                        <Text style={styles.name}>{favouriteMon.name.toUpperCase()}</Text>

                        <View style={styles.typesRow}>
                                      {favouriteMon.types.map((type) => (
                                      <Text key={favouriteMon.name + type.type.name} style={styles.type}>{type.type.name}</Text>
                                    ))}
                                    </View>

                        <View style={styles.row}>
                            <Text>Show shiny</Text>
                        <Switch
                            value={boolShowShiny}
                            onValueChange={(next: boolean) => setShowStatus(next)}
                            accessibilityLabel="Show shiny"/>
                        </View>
                        
                        {boolShowShiny ? 
                            (<Image source={{ uri: favouriteMon.imageFrontShinyLink }} style={{ width: 150, height: 150 }} />) 
                            : (<Image source={{ uri: favouriteMon.imageFrontLink }} style={{ width: 150, height: 150 }} />)}
                    </View>

                    <View style={styles.container}>
                        <Text style={styles.question}>{"Want to change your favourite?"}</Text>
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

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // aligns in (y=0 axis)
        width: "100%"
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

    typesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10
    },

    type: {
    fontSize: 28,
    fontStyle: 'italic',
    color: 'grey',
  },
})