import { Button, Linking, Text, View } from 'react-native';

export default function Info() {
    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: 10, padding: 20 }}>
            <Text style={{ fontSize: 28 }}>
                {`This is a test project made by me to learn React, React Native and Expo.\n\nHuge thanks to pokeapi.co, without them, this wouldn't be possible at all.`}
            </Text>
            <Button
            title={"Visit pokeapi.co"}
            onPress={() => {
                const url = `https://pokeapi.co`;
                Linking.openURL(url).catch((err) => console.log('Failed to open URL', err));
            }}>
            </Button>
            <View style={{marginTop: "auto"}}>
                <Text style={{ fontSize: 14 }}>
                {`Trainer Sean`}
            </Text>
            </View>
        </View>
    );
}