import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getAttemptData } from "../api/moodleApi";
import QuestionRenderer from "../components/QuestionRenderer";
import { parseQuestion } from "../parsers/questionParser";
import { ParsedQuestion } from "../types/question";

const TOKEN = "e43072d04495aafb9af1291474a5701d";
const ATTEMPT_ID = 139;

interface SurveyQuestion {
  slot: number;
  html: string;
  parsed: ParsedQuestion;
}

export default function QuestionSurveyScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [nextPage, setNextPage] = useState<number | null>(null);

  const loadPage = useCallback(async (targetPage: number) => {
    if (targetPage < 0) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getAttemptData(TOKEN, ATTEMPT_ID, targetPage);

      if (data?.exception || data?.errorcode) {
        throw new Error(data?.message || data?.errorcode || "Moodle API error");
      }

      const parsedQuestions: SurveyQuestion[] = (data?.questions ?? [])
        .filter((item: any) => typeof item?.html === "string" && item.html.trim())
        .map((item: any, index: number) => ({
          slot: Number(item.slot ?? index + 1),
          html: item.html,
          parsed: parseQuestion(item.html),
        }));

      setQuestions(parsedQuestions);
      setPage(targetPage);

      // Moodle trả nextpage = -1 khi không còn trang kế tiếp.
      const apiNextPage = Number(data?.nextpage);
      setNextPage(Number.isFinite(apiNextPage) && apiNextPage >= 0 ? apiNextPage : null);
    } catch (e) {
      console.error("LOAD QUESTION ERROR:", e);
      setError(e instanceof Error ? e.message : "Không thể tải câu hỏi từ Moodle.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

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
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
      </View>
    );
  }

  if (error && !questions.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => loadPage(page)}>
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.center}>
        <Text>Không có câu hỏi ở trang {page + 1}.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Raw Render</Text>
        <Text style={styles.subtitle}>
          Trang Moodle {page + 1} · {questions.length} câu hỏi
        </Text>
      </View>

      {error && (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{error}</Text>
        </View>
      )}

      {questions.map((item, index) => (
        <View key={`${item.slot}-${index}`} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Câu {item.slot}</Text>
          </View>

          <QuestionRenderer
            question={item.parsed}
            answers={answers}
            setAnswer={setAnswer}
          />
        </View>
      ))}

      <View style={styles.navigation}>
        <Pressable
          disabled={page === 0}
          style={[styles.navButton, page === 0 && styles.navDisabled]}
          onPress={() => loadPage(page - 1)}
        >
          <Text style={styles.navText}>← Trang trước</Text>
        </Pressable>

        <Pressable
          disabled={nextPage === null}
          style={[styles.navButton, nextPage === null && styles.navDisabled]}
          onPress={() => {
            if (nextPage !== null) loadPage(nextPage);
          }}
        >
          <Text style={styles.navText}>Trang sau →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: "#f4f6f8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: "#666",
  },
  inlineError: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff3f3",
    borderWidth: 1,
    borderColor: "#efcaca",
  },
  inlineErrorText: {
    color: "#9b1c1c",
    fontSize: 13,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e4e7eb",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  type: {
    fontSize: 12,
    color: "#666",
  },
  navigation: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  navButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  navDisabled: {
    opacity: 0.35,
  },
  navText: {
    fontWeight: "600",
  },
  debugBox: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e4e7eb",
  },
  debugTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  debugText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#aaa",
  },
  retryText: {
    fontWeight: "600",
  },
});
