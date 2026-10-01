import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Picker } from "@react-native-picker/picker";

import { SelectField } from "../types/question";

interface Props {
  question: string;

  fields: SelectField[];

  answers: Record<string, string>;

  setAnswer: (field: string, value: string) => void;
}

export default function SelectMissingWordsQuestion({
  question,
  fields,
  answers,
  setAnswer,
}: Props) {
  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {fields.map((field, index) => (
        <View key={field.fieldName} style={styles.block}>
          <Text style={styles.label}>Chỗ trống {index + 1}</Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={answers[field.fieldName] ?? ""}
              onValueChange={(value) =>
                setAnswer(field.fieldName, String(value))
              }
            >
              {field.choices.map((choice, choiceIndex) => (
                <Picker.Item
                  key={`${choice.value}-${choiceIndex}`}
                  label={choice.label || "Chọn đáp án"}
                  value={choice.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      ))}
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

  block: {
    marginBottom: 14,
  },

  label: {
    marginBottom: 6,
    fontWeight: "500",
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
});
