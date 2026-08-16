import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>welcome </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop:100,
    alignItems: "center",
    justifyContent: "center",
  },
});
