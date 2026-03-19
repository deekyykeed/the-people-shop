import { View, Text, StyleSheet } from 'react-native';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Orders coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCFCFC',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Aptos',
    color: '#707070',
  },
});
