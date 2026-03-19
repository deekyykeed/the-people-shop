import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ProductScreen() {
  const { id } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Product',
          headerShown: true,
          headerStyle: { backgroundColor: '#FCFCFC' },
          headerTintColor: '#171717',
          headerTitleStyle: { fontFamily: 'Aptos-SemiBold', fontSize: 16 },
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Product {id}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Aptos',
    color: '#333',
  },
});
