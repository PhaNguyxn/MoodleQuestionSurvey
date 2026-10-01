import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Choice } from "../types/question";

interface Props {
  question: string;
  choices: Choice[];

  answers: Record<string, string>;

  setAnswer: (field: string, value: string) => void;
}

export default function MultipleChoiceQuestion({
  question,
  choices,
  answers,
  setAnswer,
}: Props) {
  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {choices.map((choice, index) => {
        const field = choice.fieldName ?? "";

        const selected = answers[field] === "1";

        return (
          <Pressable
            key={`${field}-${index}`}
            style={[styles.choice, selected && styles.selectedChoice]}
            onPress={() => {
              if (!field) return;

              setAnswer(field, selected ? "0" : "1");
            }}
          >
            <View
              style={[styles.checkbox, selected && styles.checkboxSelected]}
            >
              {selected && <Text style={styles.check}>✓</Text>}
            </View>

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
    marginBottom: 16,
  },

  choice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 10,
  },

  selectedChoice: {
    borderColor: "#333",
  },

  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 2,
    borderColor: "#888",
    borderRadius: 5,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxSelected: {
    borderColor: "#333",
  },

  check: {
    fontWeight: "700",
  },

  label: {
    fontSize: 16,
    flex: 1,
  },
});
