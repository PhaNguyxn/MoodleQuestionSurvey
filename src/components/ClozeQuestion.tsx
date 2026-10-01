import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { ClozePart } from "../types/question";

interface Props {
  parts: ClozePart[];

  answers: Record<string, string>;

  setAnswer: (field: string, value: string) => void;
}

export default function ClozeQuestion({ parts, answers, setAnswer }: Props) {
  return (
    <View style={styles.container}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <Text key={`text-${index}`} style={styles.text}>
              {part.text}
            </Text>
          );
        }

        const field = part.fieldName ?? "";

        return (
          <TextInput
            key={`${field}-${index}`}
            value={answers[field] ?? ""}
            onChangeText={(value) => setAnswer(field, value)}
            style={styles.input}
            placeholder="..."
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },

  text: {
    fontSize: 17,
    lineHeight: 44,
  },

  input: {
    minWidth: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 5,
    fontSize: 16,
  },
});
