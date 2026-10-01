import React, { useState } from "react";

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { DragItem, DropField } from "../types/question";

interface Props {
  question: string;

  image?: string;

  items: DragItem[];

  fields: DropField[];

  answers: Record<string, string>;

  setAnswer: (field: string, value: string) => void;
}

export default function DragDropImageQuestion({
  question,
  image,
  items,
  fields,
  answers,
  setAnswer,
}: Props) {
  const [selected, setSelected] = useState<DragItem | null>(null);

  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {image && (
        <Image
          source={{ uri: image }}
          resizeMode="contain"
          style={styles.image}
        />
      )}

      <Text style={styles.title}>Nhãn</Text>

      <View style={styles.items}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelected(item)}
            style={[styles.item, selected?.id === item.id && styles.selected]}
          >
            <Text>{item.text}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.title}>Vùng thả</Text>

      {fields.map((field) => {
        const value = answers[field.fieldName];

        const selectedItem = items.find(
          (item) => String(item.choice) === value,
        );

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
              Vùng {field.place}: {selectedItem?.text ?? "Chưa chọn"}
            </Text>
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
    marginBottom: 14,
  },

  image: {
    width: "100%",
    height: 300,
    marginBottom: 14,
  },

  title: {
    fontWeight: "600",
    marginVertical: 10,
  },

  items: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  item: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
  },

  selected: {
    borderWidth: 2,
    borderColor: "#333",
  },

  drop: {
    padding: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 10,
    marginBottom: 8,
  },
});
