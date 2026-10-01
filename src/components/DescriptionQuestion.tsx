import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  text: string;
}

export default function DescriptionQuestion({ text }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },

  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});
