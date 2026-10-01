import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
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

  if (url.includes("/pluginfile.php/") && !url.includes("/webservice/pluginfile.php/")) {
    url = url.replace("/pluginfile.php/", "/webservice/pluginfile.php/");
  }

  if (!token) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

function parseCoordinate(value?: string): { x: number; y: number } | null {
  if (!value) return null;

  const match = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;

  return {
    x: Number(match[1]),
    y: Number(match[2]),
  };
}

export default function DragMarkerQuestion({
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
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const imageUrl = useMemo(
    () => buildAuthenticatedImageUrl(image, token),
    [image, token],
  );

  useEffect(() => {
    if (!imageUrl) return;

    Image.getSize(
      imageUrl,
      (width, height) => setNaturalSize({ width, height }),
      (error) => {
        console.error("MARKER IMAGE SIZE ERROR:", error);
        setImageFailed(true);
      },
    );
  }, [imageUrl]);

  const imageAspectRatio =
    naturalSize.width > 0 && naturalSize.height > 0
      ? naturalSize.width / naturalSize.height
      : 1.6;

  const onImageLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    const height = width / imageAspectRatio;
    setDisplaySize({ width, height });
  };

  const selectedField = selected
    ? fields[(selected.choice ?? 1) - 1]
    : undefined;

  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      <Text style={styles.title}>Chọn marker</Text>
      <View style={styles.markers}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.marker, selected?.id === item.id && styles.selected]}
            onPress={() => setSelected(item)}
          >
            <Text style={styles.markerText}>⊕ {item.text}</Text>
          </Pressable>
        ))}
      </View>

      {imageUrl && !imageFailed ? (
        <View
          style={styles.imageWrapper}
          onLayout={onImageLayout}
        >
          <Pressable
            style={[
              styles.imagePressable,
              { aspectRatio: imageAspectRatio },
            ]}
            onPress={(event) => {
              if (!selected || !selectedField) return;
              if (!displaySize.width || !displaySize.height) return;
              if (!naturalSize.width || !naturalSize.height) return;

              const { locationX, locationY } = event.nativeEvent;

              const originalX = Math.round(
                (locationX / displaySize.width) * naturalSize.width,
              );
              const originalY = Math.round(
                (locationY / displaySize.height) * naturalSize.height,
              );

              setAnswer(selectedField.fieldName, `${originalX},${originalY}`);
              setSelected(null);
            }}
          >
            <Image
              source={{ uri: imageUrl }}
              resizeMode="contain"
              style={StyleSheet.absoluteFillObject}
              onError={(event) => {
                console.error("MARKER IMAGE ERROR:", event.nativeEvent.error);
                setImageFailed(true);
              }}
            />

            {items.map((item) => {
              const field = fields[(item.choice ?? 1) - 1];
              if (!field) return null;

              const coordinate = parseCoordinate(answers[field.fieldName]);
              if (!coordinate || !naturalSize.width || !naturalSize.height) return null;

              const left = (coordinate.x / naturalSize.width) * displaySize.width;
              const top = (coordinate.y / naturalSize.height) * displaySize.height;

              return (
                <View
                  key={`placed-${item.id}`}
                  pointerEvents="none"
                  style={[
                    styles.placedMarker,
                    {
                      left: left - 12,
                      top: top - 12,
                    },
                  ]}
                >
                  <Text style={styles.placedMarkerText}>⊕</Text>
                </View>
              );
            })}
          </Pressable>
        </View>
      ) : image ? (
        <View style={styles.imageErrorBox}>
          <Text style={styles.imageErrorTitle}>Không tải được hình câu hỏi</Text>
          <Text style={styles.imageErrorText}>
            Kiểm tra Moodle URL, token Web Service và khả năng điện thoại truy cập máy chủ Moodle.
          </Text>
        </View>
      ) : (
        <View style={styles.imageErrorBox}>
          <Text style={styles.imageErrorTitle}>
            Không tìm thấy hình nền trong response Moodle
          </Text>
        </View>
      )}

      <Text style={styles.hint}>
        Chọn một marker ở trên, sau đó chạm vào vị trí tương ứng trên hình để đặt marker.
      </Text>

      {fields.length > 0 && (
        <View style={styles.debugArea}>
          {items.map((item) => {
            const field = fields[(item.choice ?? 1) - 1];
            if (!field) return null;

            return (
              <Text key={`coord-${item.id}`} style={styles.coordinateText}>
                {item.text}: {answers[field.fieldName] || "Chưa đặt"}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 16,
  },
  title: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 10,
  },
  markers: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  marker: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  selected: {
    borderWidth: 2,
    borderColor: "#333",
  },
  markerText: {
    fontSize: 16,
  },
  imageWrapper: {
    width: "100%",
    marginBottom: 12,
  },
  imagePressable: {
    width: "100%",
    position: "relative",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    overflow: "hidden",
  },
  placedMarker: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#333",
  },
  placedMarkerText: {
    fontSize: 16,
    fontWeight: "700",
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
  hint: {
    marginTop: 4,
    color: "#555",
    lineHeight: 20,
  },
  debugArea: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f6f7f8",
  },
  coordinateText: {
    fontSize: 13,
    marginBottom: 4,
  },
});
