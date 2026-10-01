import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  question: string;
  value: string;
  numeric?: boolean;

  onChange: (value: string) => void;
}

export default function TextQuestion({
  question,
  value,
  numeric = false,
  onChange,
}: Props) {
  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? "decimal-pad" : "default"}
        placeholder="Nhập câu trả lời..."
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
