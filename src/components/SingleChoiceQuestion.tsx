import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Choice } from "../types/question";

interface Props {
  question: string;
  choices: Choice[];
  value?: string;
  onChange: (value: string) => void;
}

export default function SingleChoiceQuestion({
  question,
  choices,
  value,
  onChange,
}: Props) {
  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {choices.map((choice) => {
        const selected = value === choice.value;

        return (
          <Pressable
            key={`${choice.value}-${choice.label}`}
            style={[styles.choice, selected && styles.choiceSelected]}
            onPress={() => onChange(choice.value)}
          >
            <View style={[styles.radio, selected && styles.radioSelected]} />

            <Text style={styles.label}>{choice.label}</Text>
          </Pressable>
        );
      })}
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

  choice: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  choiceSelected: {
    borderColor: "#333",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#888",
    marginRight: 12,
  },

  radioSelected: {
    borderWidth: 7,
    borderColor: "#333",
  },

  label: {
    flex: 1,
    fontSize: 16,
  },
});
