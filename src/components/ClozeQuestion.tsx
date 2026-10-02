import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { ClozePart } from "../types/question";

interface Props {
  parts: ClozePart[];
  qtextHtml?: string;
  rawHtml?: string;
  answers: Record<string, string>;
  setAnswer: (field: string, value: string) => void;
}

type RenderPart =
  | { type: "text"; text: string }
  | { type: "input"; fieldName: string; size?: number };

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"');
}

function stripTags(value: string): string {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  );
}

function extractQuestionHtml(qtextHtml?: string, rawHtml?: string): string {
  if (qtextHtml?.trim()) return qtextHtml;
  if (!rawHtml) return "";

  // Cloze của Moodle 4.x trong response thực tế không có .qtext.
  // Nội dung câu nằm trực tiếp trong .formulation, ví dụ:
  // <div class="formulation ..."><h4 ...>...</h4><input hidden .../><p>...</p></div>
  const formulationMatch = rawHtml.match(
    /<div\b[^>]*class=["'][^"']*\bformulation\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  );

  if (!formulationMatch?.[1]) return "";

  let formulation = formulationMatch[1];

  // Ưu tiên paragraph chứa nội dung câu hỏi.
  const paragraphMatch = formulation.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (paragraphMatch?.[1]) {
    return paragraphMatch[1];
  }

  // Fallback: bỏ heading/input hidden đầu formulation.
  formulation = formulation
    .replace(/<h4\b[^>]*>[\s\S]*?<\/h4>/gi, "")
    .replace(/<input\b[^>]*type=["']hidden["'][^>]*>/gi, "");

  return formulation;
}

/**
 * Parse trực tiếp HTML câu Cloze Moodle thành chuỗi text/input theo đúng thứ tự.
 */
function parseClozeHtml(qtextHtml?: string, rawHtml?: string): RenderPart[] {
  const sourceHtml = extractQuestionHtml(qtextHtml, rawHtml);
  if (!sourceHtml) return [];

  const html = sourceHtml.replace(
    /<label\b[^>]*class=["'][^"']*(?:accesshide|sr-only|visually-hidden)[^"']*["'][^>]*>[\s\S]*?<\/label>/gi,
    "",
  );

  const result: RenderPart[] = [];
  const inputRegex = /<input\b([^>]*)>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inputRegex.exec(html)) !== null) {
    const before = stripTags(html.slice(lastIndex, match.index));
    if (before) {
      result.push({ type: "text", text: before });
    }

    const attrs = match[1] ?? "";
    const type =
      attrs.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "text";
    const fieldName = attrs.match(/\bname=["']([^"']+)["']/i)?.[1] ?? "";
    const sizeRaw = attrs.match(/\bsize=["']([^"']+)["']/i)?.[1];
    const size = sizeRaw ? Number(sizeRaw) : undefined;

    if (type !== "hidden" && fieldName) {
      result.push({
        type: "input",
        fieldName,
        size: Number.isFinite(size) ? size : undefined,
      });
    }

    lastIndex = inputRegex.lastIndex;
  }

  const after = stripTags(html.slice(lastIndex));
  if (after) {
    result.push({ type: "text", text: after });
  }

  return result.filter((part) => {
    if (part.type === "input") return Boolean(part.fieldName);
    return part.text.trim().length > 0;
  });
}

export default function ClozeQuestion({
  parts,
  qtextHtml,
  rawHtml,
  answers,
  setAnswer,
}: Props) {
  const parsedFromHtml = useMemo(
    () => parseClozeHtml(qtextHtml, rawHtml),
    [qtextHtml, rawHtml],
  );

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

  if (renderParts.length === 0) {
    return (
      <View style={styles.fallbackBox}>
        <Text style={styles.fallbackText}>
          Không đọc được nội dung câu trả lời nhúng từ Moodle.
        </Text>
      </View>
    );
  }

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
        const isShortNumeric = Boolean(part.size && part.size <= 4);

        return (
          <TextInput
            key={`${field}-${index}`}
            value={answers[field] ?? ""}
            onChangeText={(value) => setAnswer(field, value)}
            style={[
              styles.input,
              isShortNumeric ? styles.shortInput : styles.longInput,
            ]}
            placeholder="..."
            keyboardType={isShortNumeric ? "decimal-pad" : "default"}
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
  longInput: {
    minWidth: 190,
  },
  shortInput: {
    minWidth: 74,
  },
  fallbackBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  fallbackText: {
    color: "#666",
  },
});
