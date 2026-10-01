import React, { useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";
import { parse } from "node-html-parser";

import { DragItem, DropField } from "../types/question";

interface Props {
  question: string;
  qtextHtml?: string;
  items: DragItem[];
  fields: DropField[];
  answers: Record<string, string>;
  setAnswer: (field: string, value: string) => void;
}

function buildCleanQuestionText(html?: string, fallback = ""): string {
  if (!html) {
    return fallback
      .replace(/Blank\s*\d+\s*Question\s*\d+/gi, " ___ ")
      .replace(/\s+/g, " ")
      .trim();
  }

  let cleaned = html
    // Xóa nội dung trợ năng của Moodle nhưng giữ vị trí drop bằng placeholder.
    .replace(
      /<(?:label|span)[^>]*class=["'][^"']*(?:accesshide|sr-only|visually-hidden)[^"']*["'][^>]*>[\s\S]*?<\/(?:label|span)>/gi,
      "",
    )
    // Các drop-zone ddwtos thường là span.place1/place2...
    .replace(
      /<span[^>]*class=["'][^"']*(?:place\d+|drop)[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
      " ___ ",
    );

  const root = parse(cleaned);

  return root.text
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    // Fallback nếu accessibility text vẫn còn ở theme Moodle hiện tại.
    .replace(/Blank\s*\d+\s*Question\s*\d+/gi, " ___ ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DragDropTextQuestion({
  question,
  qtextHtml,
  items,
  fields,
  answers,
  setAnswer,
}: Props) {
  const [selected, setSelected] = useState<DragItem | null>(null);

  const displayQuestion = useMemo(
    () => buildCleanQuestionText(qtextHtml, question),
    [qtextHtml, question],
  );

  return (
    <View>
      <Text style={styles.question}>{displayQuestion}</Text>

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
            <Text style={styles.dropText}>
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
            <Text style={styles.choiceText}>{item.text}</Text>
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
    lineHeight: 27,
    marginBottom: 16,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
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
    justifyContent: "center",
  },
  dropText: {
    fontSize: 16,
  },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  choice: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  choiceText: {
    fontSize: 16,
  },
  selected: {
    borderColor: "#333",
    borderWidth: 2,
  },
});
