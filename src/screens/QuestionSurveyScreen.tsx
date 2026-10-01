import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getAttemptData } from "../api/moodleApi";

import { parseQuestion } from "../parsers/questionParser";

import QuestionRenderer from "../components/QuestionRenderer";

const TOKEN = "e43072d04495aafb9af1291474a5701d";
const ATTEMPT_ID = 140;

export default function QuizScreen() {
  const [loading, setLoading] = useState(true);

  const [html, setHtml] = useState("");

  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    try {
      setLoading(true);

      const data = await getAttemptData(TOKEN, ATTEMPT_ID, 0);

      const question = data.questions?.[0];

      if (question?.html) {
        setHtml(question.html);
      }
    } catch (error) {
      console.error("LOAD QUESTION ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const question = useMemo(() => {
    if (!html) return null;

    return parseQuestion(html);
  }, [html]);

  const setAnswer = (field: string, value: string) => {
    if (!field) return;

    setAnswers((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.center}>
        <Text>Không có câu hỏi.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.type}>Type: {question.type}</Text>

      <QuestionRenderer
        question={question}
        answers={answers}
        setAnswer={setAnswer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  type: {
    marginBottom: 20,
    fontSize: 13,
  },

  debug: {
    marginTop: 30,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
  },

  debugTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
});
