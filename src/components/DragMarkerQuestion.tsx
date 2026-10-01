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
  rawHtml?: string;
  token?: string;
  items: DragItem[];
  fields: DropField[];
  answers: Record<string, string>;
  setAnswer: (field: string, value: string) => void;
}

function decodeHtmlUrl(value?: string): string | undefined {
  if (!value) return undefined;

  return value
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/g, "&")
    .replace(/&#x26;/gi, "&")
    .trim();
}

function extractMarkerBackground(rawHtml?: string): string | undefined {
  if (!rawHtml) return undefined;

  const candidates: string[] = [];
  const imgRegex = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(rawHtml)) !== null) {
    const src = decodeHtmlUrl(match[1]);
    if (src) candidates.push(src);
  }

  const exact = candidates.find((src) => /qtype_ddmarker\/bgimage/i.test(src));
  if (exact) return exact;

  const probable = candidates.find(
    (src) => /ddmarker/i.test(src) && /bgimage/i.test(src),
  );
  if (probable) return probable;

  const styleMatch = rawHtml.match(
    /background-image\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/i,
  );
  const styleUrl = decodeHtmlUrl(styleMatch?.[1]);
  if (styleUrl && /qtype_ddmarker\/bgimage/i.test(styleUrl)) {
    return styleUrl;
  }

  return undefined;
}

function buildAuthenticatedImageUrl(
  image?: string,
  token?: string,
): string | undefined {
  const decoded = decodeHtmlUrl(image);
  if (!decoded) return undefined;

  let url = decoded;

  if (
    url.includes("/pluginfile.php/") &&
    !url.includes("/webservice/pluginfile.php/")
  ) {
    url = url.replace(
      "/pluginfile.php/",
      "/webservice/pluginfile.php/",
    );
  }

  if (token && !/[?&]token=/.test(url)) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}token=${encodeURIComponent(token)}`;
  }

  // Tránh iOS giữ ảnh cũ trong cache khi Moodle thay file nhưng URL không đổi.
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_ts=${Date.now()}`;
}

function parseCoordinate(value?: string): { x: number; y: number } | null {
  if (!value) return null;

  const match = value.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
  );
  if (!match) return null;

  return {
    x: Number(match[1]),
    y: Number(match[2]),
  };
}

export default function DragMarkerQuestion({
  question,
  image,
  rawHtml,
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
  const [imageLoaded, setImageLoaded] = useState(false);

  const extractedBackground = useMemo(
    () => extractMarkerBackground(rawHtml),
    [rawHtml],
  );

  const sourceImage = extractedBackground ?? image;

  const imageUrl = useMemo(
    () => buildAuthenticatedImageUrl(sourceImage, token),
    [sourceImage, token],
  );

  const imageAspectRatio =
    naturalSize.width > 0 && naturalSize.height > 0
      ? naturalSize.width / naturalSize.height
      : 1.6;

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
        <Pressable
          style={[styles.imagePressable, { aspectRatio: imageAspectRatio }]}
          onLayout={(event) => {
            setDisplaySize({
              width: event.nativeEvent.layout.width,
              height: event.nativeEvent.layout.height,
            });
          }}
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
          {!imageLoaded && (
            <View style={styles.loadingLayer} pointerEvents="none">
              <Text style={styles.loadingText}>Đang tải hình nền...</Text>
            </View>
          )}

          <Image
            source={{ uri: imageUrl, cache: "reload" }}
            resizeMode="contain"
            style={styles.backgroundImage}
            onLoad={(event) => {
              const source = event.nativeEvent.source;

              if (source?.width && source?.height) {
                setNaturalSize({
                  width: source.width,
                  height: source.height,
                });
              }

              setImageLoaded(true);
            }}
            onError={(event) => {
              setImageFailed(true);
              setImageLoaded(false);

              console.error("MARKER IMAGE ERROR:", event.nativeEvent.error);
            }}
          />

          {items.map((item) => {
            const field = fields[(item.choice ?? 1) - 1];
            if (!field) return null;

            const coordinate = parseCoordinate(answers[field.fieldName]);
            if (
              !coordinate ||
              !naturalSize.width ||
              !naturalSize.height ||
              !displaySize.width ||
              !displaySize.height
            ) {
              return null;
            }

            const left = (coordinate.x / naturalSize.width) * displaySize.width;
            const top =
              (coordinate.y / naturalSize.height) * displaySize.height;

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
      ) : (
        <View style={styles.imageErrorBox}>
          <Text style={styles.imageErrorTitle}>
            {sourceImage
              ? "Không tải được hình nền câu hỏi"
              : "Không tìm thấy URL ảnh nền qtype_ddmarker/bgimage"}
          </Text>
          <Text style={styles.imageErrorText}>
            Ảnh marker phải được lấy từ đúng trường qtype_ddmarker/bgimage trong
            question.html.
          </Text>
        </View>
      )}

      <Text style={styles.hint}>
        Chọn một marker ở trên, sau đó chạm vào vị trí tương ứng trên hình để
        đặt marker.
      </Text>

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
  imagePressable: {
    width: "100%",
    position: "relative",
    backgroundColor: "#ededed",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
  },
  loadingLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#666",
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
  statusBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f1f3f5",
  },
  statusText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
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

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
});
