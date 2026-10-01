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

export default function DragMarkerQuestion({ question, image, items }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.markers}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.marker, selected === item.id && styles.selected]}
            onPress={() => setSelected(item.id)}
          >
            <Text>⊕ {item.text}</Text>
          </Pressable>
        ))}
      </View>

      {image && (
        <Image
          source={{ uri: image }}
          resizeMode="contain"
          style={styles.image}
        />
      )}

      <Text style={styles.warning}>
        Cần bổ sung geometry vùng đáp án trước khi triển khai đặt marker chính
        xác trên ảnh.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  markers: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  marker: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  selected: {
    borderWidth: 2,
    borderColor: "#333",
  },

  image: {
    width: "100%",
    height: 320,
  },

  warning: {
    marginTop: 12,
    fontSize: 13,
  },
});
