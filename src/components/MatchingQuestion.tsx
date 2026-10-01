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

export default function MatchingQuestion({
  question,
  fields,
  answers,
  setAnswer,
}: Props) {
  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {fields.map((field) => (
        <View key={field.fieldName} style={styles.row}>
          <Text style={styles.item}>{field.label}</Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={answers[field.fieldName] ?? "0"}
              onValueChange={(value) =>
                setAnswer(field.fieldName, String(value))
              }
            >
              {field.choices.map((choice, index) => (
                <Picker.Item
                  key={`${choice.value}-${index}`}
                  label={choice.label || "Chọn..."}
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
    marginBottom: 18,
  },

  row: {
    marginBottom: 18,
  },

  item: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
});
