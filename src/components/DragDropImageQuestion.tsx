import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { DragItem, DropField } from "../types/question";

interface Props {
  question: string;
  image?: string;
  token?: string;
  items: DragItem[];
  fields: DropField[];
  answers: Record<string, string>;
  setAnswer: (field: string, value: string) => void;
}

function buildAuthenticatedImageUrl(image?: string, token?: string): string | undefined {
  if (!image) return undefined;

  let url = image;

  // Moodle file URLs returned in question.html may use pluginfile.php.
  // For web-service access, use webservice/pluginfile.php when possible.
  if (url.includes("/pluginfile.php/") && !url.includes("/webservice/pluginfile.php/")) {
    url = url.replace("/pluginfile.php/", "/webservice/pluginfile.php/");
  }

  if (!token) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

export default function DragDropImageQuestion({
  question,
  image,
  token,
  items,
  fields,
  answers,
  setAnswer,
}: Props) {
  const [selected, setSelected] = useState<DragItem | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = useMemo(
    () => buildAuthenticatedImageUrl(image, token),
    [image, token],
  );

  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {imageUrl && !imageFailed ? (
        <Image
          source={{ uri: imageUrl }}
          resizeMode="contain"
          style={styles.image}
          onError={(event) => {
            console.error("QUESTION IMAGE ERROR:", event.nativeEvent.error);
            setImageFailed(true);
          }}
        />
      ) : image ? (
        <View style={styles.imageErrorBox}>
          <Text style={styles.imageErrorTitle}>Không tải được hình câu hỏi</Text>
          <Text style={styles.imageErrorText}>
            Kiểm tra Moodle URL, token Web Service và khả năng điện thoại truy cập máy chủ Moodle.
          </Text>
        </View>
      ) : (
        <View style={styles.imageErrorBox}>
          <Text style={styles.imageErrorTitle}>Không tìm thấy hình nền trong response Moodle</Text>
        </View>
      )}

      <Text style={styles.title}>Nhãn</Text>

      <View style={styles.items}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelected(item)}
            style={[styles.item, selected?.id === item.id && styles.selected]}
          >
            <Text style={styles.itemText}>{item.text}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.title}>Vùng thả</Text>

      {fields.map((field) => {
        const value = answers[field.fieldName];
        const selectedItem = items.find((item) => String(item.choice) === value);

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
    lineHeight: 26,
    marginBottom: 14,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 14,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  imageErrorBox: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#e1bcbc",
    backgroundColor: "#fff6f6",
    borderRadius: 10,
    padding: 14,
    justifyContent: "center",
    marginBottom: 14,
  },
  imageErrorTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  imageErrorText: {
    color: "#666",
    lineHeight: 20,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  itemText: {
    fontSize: 16,
  },
  selected: {
    borderWidth: 2,
    borderColor: "#333",
  },
  drop: {
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: "center",
  },
  dropText: {
    fontSize: 16,
  },
});
