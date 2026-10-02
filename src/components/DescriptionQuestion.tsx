import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import RenderHTML from "react-native-render-html";

interface Props {
  html?: string;
  text: string;
}

export default function DescriptionQuestion({ html, text }: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.card}>
      <RenderHTML
        contentWidth={Math.max(0, width - 64)}
        source={{ html: html || `<p>${text}</p>` }}
        ignoredDomTags={["script"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
});
