import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  question: string;
  value: string;

  onChange: (value: string) => void;
}

export default function EssayQuestion({ question, value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      <TextInput
        multiline
        value={value}
        onChangeText={onChange}
        placeholder="Nhập câu trả lời tự luận..."
        textAlignVertical="top"
        style={styles.editor}
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

  editor: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    lineHeight: 23,
  },
});
