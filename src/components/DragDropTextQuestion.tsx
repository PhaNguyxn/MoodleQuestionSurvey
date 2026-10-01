import React, { useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { DragItem, DropField } from "../types/question";

interface Props {
  question: string;

  items: DragItem[];

  fields: DropField[];

  answers: Record<string, string>;

  setAnswer: (field: string, value: string) => void;
}

export default function DragDropTextQuestion({
  question,
  items,
  fields,
  answers,
  setAnswer,
}: Props) {
  const [selected, setSelected] = useState<DragItem | null>(null);

  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      <Text style={styles.title}>Vị trí:</Text>

      {fields.map((field) => {
        const current = answers[field.fieldName];

        const item = items.find((x) => String(x.choice) === current);

        return (
          <Pressable
            key={field.fieldName}
            style={styles.drop}
            onPress={() => {
              if (!selected) return;

              setAnswer(field.fieldName, String(selected.choice));

              setSelected(null);
            }}
          >
            <Text>
              Vị trí {field.place}: {item?.text ?? "Chọn đáp án"}
            </Text>
          </Pressable>
        );
      })}

      <Text style={styles.title}>Lựa chọn:</Text>

      <View style={styles.choices}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelected(item)}
            style={[styles.choice, selected?.id === item.id && styles.selected]}
          >
            <Text>{item.text}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  title: {
    fontWeight: "600",
    marginVertical: 10,
  },

  drop: {
    minHeight: 50,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },

  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  choice: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
  },

  selected: {
    borderColor: "#333",
    borderWidth: 2,
  },
});
