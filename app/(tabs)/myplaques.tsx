import { StyleSheet, Text, View } from 'react-native';

export default function MyPlaquesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Plaques</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 18,
    color: '#1a4fa0',
  },
});
