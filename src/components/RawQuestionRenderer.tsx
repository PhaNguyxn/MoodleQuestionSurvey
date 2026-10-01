import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import RenderHTML from "react-native-render-html";

interface Props {
  html: string;
}

export default function RawQuestionRenderer({ html }: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <RenderHTML
        contentWidth={width - 32}
        source={{
          html: html,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
