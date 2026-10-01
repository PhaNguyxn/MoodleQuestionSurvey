import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { parse } from "node-html-parser";

import { ClozePart } from "../types/question";

interface Props {
  parts: ClozePart[];
  html?: string;
  answers: Record<string, string>;
  setAnswer: (field: string, value: string) => void;
}

type RenderPart =
  | { type: "text"; text: string }
  | { type: "input"; fieldName: string; size?: number };

function decodeText(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"');
}

function parseClozeHtml(html?: string): RenderPart[] {
  if (!html) return [];

  const root = parse(html);
  const qtext = root.querySelector(".qtext") ?? root;
  const result: RenderPart[] = [];

  const pushText = (value: string) => {
    const text = decodeText(value);
    if (!text) return;

    const last = result[result.length - 1];
    if (last?.type === "text") {
      last.text += text;
    } else {
      result.push({ type: "text", text });
    }
  };

  const walk = (node: any) => {
    if (!node) return;

    // Text node.
    if (node.nodeType === 3) {
      pushText(node.rawText ?? "");
      return;
    }

    const tagName = String(node.tagName ?? "").toUpperCase();
    const className = String(node.getAttribute?.("class") ?? "");

    // Moodle accessibility labels such as "Answer 1 Question 1" must not be shown.
    if (/\b(accesshide|sr-only|visually-hidden)\b/i.test(className)) {
      return;
    }

    if (tagName === "BR") {
      pushText("\n");
      return;
    }

    if (tagName === "INPUT") {
      const type = String(node.getAttribute?.("type") ?? "text").toLowerCase();
      const fieldName = node.getAttribute?.("name") ?? "";

      if (type !== "hidden" && fieldName) {
        const size = Number(node.getAttribute?.("size") ?? 0) || undefined;
        result.push({ type: "input", fieldName, size });
      }
      return;
    }

    // Current survey sample uses embedded Short Answer/Numerical controls.
    // Recurse through wrapper elements such as <p> and <span class="subquestion">.
    const children = node.childNodes ?? [];
    children.forEach((child: any) => walk(child));
  };

  walk(qtext);

  return result.filter((part) => {
    if (part.type === "input") return Boolean(part.fieldName);
    return part.text.length > 0;
  });
}

export default function ClozeQuestion({
  parts,
  html,
  answers,
  setAnswer,
}: Props) {
  const parsedFromHtml = useMemo(() => parseClozeHtml(html), [html]);

  const renderParts: RenderPart[] =
    parsedFromHtml.length > 0
      ? parsedFromHtml
      : parts.map((part) =>
          part.type === "text"
            ? { type: "text" as const, text: part.text ?? "" }
            : {
                type: "input" as const,
                fieldName: part.fieldName ?? "",
              },
        );

  return (
    <View style={styles.container}>
      {renderParts.map((part, index) => {
        if (part.type === "text") {
          return (
            <Text key={`text-${index}`} style={styles.text}>
              {part.text}
            </Text>
          );
        }

        const field = part.fieldName;
        const inputWidth = part.size && part.size <= 4 ? 74 : 180;

        return (
          <TextInput
            key={`${field}-${index}`}
            value={answers[field] ?? ""}
            onChangeText={(value) => setAnswer(field, value)}
            style={[styles.input, { minWidth: inputWidth }]}
            placeholder="..."
            keyboardType={part.size && part.size <= 4 ? "decimal-pad" : "default"}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  text: {
    fontSize: 17,
    lineHeight: 42,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 5,
    marginVertical: 4,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});
