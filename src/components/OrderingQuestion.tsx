import React, { useEffect, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { OrderingItem } from "../types/question";

interface Props {
  question: string;

  items: OrderingItem[];

  fieldName: string;

  setAnswer: (field: string, value: string) => void;
}

export default function OrderingQuestion({
  question,
  items: initialItems,
  fieldName,
  setAnswer,
}: Props) {
  const [items, setItems] = useState<OrderingItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (!fieldName) return;

    const value = items.map((item) => item.id).join(",");

    setAnswer(fieldName, value);
  }, [items, fieldName]);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;

    if (target < 0 || target >= items.length) {
      return;
    }

    setItems((current) => {
      const copy = [...current];

      [copy[index], copy[target]] = [copy[target], copy[index]];

      return copy;
    });
  };

  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {items.map((item, index) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.grip}>☰</Text>

          <Text style={styles.itemText}>{item.text}</Text>

          <Pressable
            disabled={index === 0}
            onPress={() => move(index, -1)}
            style={styles.button}
          >
            <Text>↑</Text>
          </Pressable>

          <Pressable
            disabled={index === items.length - 1}
            onPress={() => move(index, 1)}
            style={styles.button}
          >
            <Text>↓</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },

  grip: {
    fontSize: 20,
    marginRight: 10,
  },

  itemText: {
    flex: 1,
    fontSize: 16,
  },

  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
