import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { parse } from "node-html-parser";

import { Choice, SelectField } from "../types/question";

interface Props {
  question: string;
  qtextHtml?: string;
  fields: SelectField[];
  answers: Record<string, string>;
  setAnswer: (field: string, value: string) => void;
}

function buildCleanQuestionText(html?: string, fallback = ""): string {
  if (!html) {
    return fallback
      .replace(/Blank\s+\d+\s+Question\s+\d+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Moodle chèn nhãn trợ năng như "Blank 1 Question 1" quanh <select>.
  // Beauty Render không cần hiển thị các nhãn này; ta giữ một placeholder ___
  // để người dùng vẫn thấy đúng vị trí chỗ trống trong câu.
  let cleaned = html
    .replace(
      /<(?:label|span)[^>]*class=["'][^"']*(?:accesshide|sr-only|visually-hidden)[^"']*["'][^>]*>[\s\S]*?<\/(?:label|span)>/gi,
      "",
    )
    .replace(/<select[\s\S]*?<\/select>/gi, " ___ ");

  const root = parse(cleaned);

  return root.text
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    // Một số theme/plugin Moodle để accessibility text thành text node thường.
    // Xóa mẫu này sau khi chuyển HTML -> text để tránh hiện trên mobile.
    .replace(/Blank\s+\d+\s+Question\s+\d+/gi, "")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function selectedLabel(field: SelectField, value?: string): string {
  if (!value) return "Chọn đáp án";

  return (
    field.choices.find((choice) => choice.value === value)?.label ||
    "Chọn đáp án"
  );
}

export default function SelectMissingWordsQuestion({
  question,
  qtextHtml,
  fields,
  answers,
  setAnswer,
}: Props) {
  const [activeField, setActiveField] = useState<SelectField | null>(null);

  const displayQuestion = useMemo(
    () => buildCleanQuestionText(qtextHtml, question),
    [qtextHtml, question],
  );

  const choose = (choice: Choice) => {
    if (!activeField) return;

    setAnswer(activeField.fieldName, choice.value);
    setActiveField(null);
  };

  return (
    <View>
      <Text style={styles.question}>{displayQuestion}</Text>

      {fields.map((field, index) => (
        <View key={field.fieldName} style={styles.block}>
          <Text style={styles.label}>Chỗ trống {index + 1}</Text>

          <Pressable
            style={styles.selectButton}
            onPress={() => setActiveField(field)}
          >
            <Text
              style={[
                styles.selectText,
                !answers[field.fieldName] && styles.placeholderText,
              ]}
            >
              {selectedLabel(field, answers[field.fieldName])}
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
        </View>
      ))}

      <Modal
        visible={Boolean(activeField)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveField(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setActiveField(null)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Chọn đáp án</Text>

            <ScrollView style={styles.optionsList}>
              {activeField?.choices
                // Bỏ option placeholder rỗng vì UI đã có "Chọn đáp án" riêng.
                .filter((choice) => Boolean(choice.value))
                .map((choice, index) => {
                  const isSelected =
                    answers[activeField.fieldName] === choice.value;

                  return (
                    <Pressable
                      key={`${choice.value}-${index}`}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionSelected,
                      ]}
                      onPress={() => choose(choice)}
                    >
                      <Text style={styles.optionText}>{choice.label}</Text>
                    </Pressable>
                  );
                })}
            </ScrollView>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setActiveField(null)}
            >
              <Text style={styles.cancelText}>Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 28,
    marginBottom: 18,
  },
  block: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 7,
    fontWeight: "600",
    fontSize: 15,
  },
  selectButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d2d6dc",
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: "#8a8f98",
  },
  chevron: {
    fontSize: 22,
    marginLeft: 10,
    color: "#666",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  optionsList: {
    maxHeight: 360,
  },
  optionRow: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  optionSelected: {
    backgroundColor: "#f1f3f5",
  },
  optionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f1f3f5",
  },
  cancelText: {
    fontWeight: "600",
  },
});
