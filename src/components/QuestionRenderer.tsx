import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ParsedQuestion } from "../types/question";

import ClozeQuestion from "./ClozeQuestion";
import DescriptionQuestion from "./DescriptionQuestion";
import DragDropImageQuestion from "./DragDropImageQuestion";
import DragDropTextQuestion from "./DragDropTextQuestion";
import DragMarkerQuestion from "./DragMarkerQuestion";
import EssayQuestion from "./EssayQuestion";
import MatchingQuestion from "./MatchingQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import OrderingQuestion from "./OrderingQuestion";
import SelectMissingWordsQuestion from "./SelectMissingWordsQuestion";
import SingleChoiceQuestion from "./SingleChoiceQuestion";
import TextQuestion from "./TextQuestion";

interface Props {
  question: ParsedQuestion;
  answers: Record<string, string>;
  setAnswer: (field: string, value: string) => void;
  token?: string;
}

export default function QuestionRenderer({
  question,
  answers,
  setAnswer,
  token,
}: Props) {
  switch (question.type) {
    case "description":
      return (
        <DescriptionQuestion
          text={question.text}
          html={question.qtextHtml}
        />
      );

    case "multichoice-single":
    case "truefalse":
    case "calculatedmulti":
      return (
        <SingleChoiceQuestion
          question={question.text}
          choices={question.choices ?? []}
          value={question.fieldName ? answers[question.fieldName] : undefined}
          onChange={(value) => {
            if (question.fieldName) {
              setAnswer(question.fieldName, value);
            }
          }}
        />
      );

    case "multichoice-multiple":
      return (
        <MultipleChoiceQuestion
          question={question.text}
          choices={question.choices ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case "shortanswer":
      return (
        <TextQuestion
          question={question.text}
          value={question.fieldName ? (answers[question.fieldName] ?? "") : ""}
          onChange={(value) => {
            if (question.fieldName) setAnswer(question.fieldName, value);
          }}
        />
      );

    case "numerical":
    case "calculated":
    case "calculatedsimple":
      return (
        <TextQuestion
          question={question.text}
          numeric
          value={question.fieldName ? (answers[question.fieldName] ?? "") : ""}
          onChange={(value) => {
            if (question.fieldName) setAnswer(question.fieldName, value);
          }}
        />
      );

    case "essay":
      return (
        <EssayQuestion
          question={question.text}
          value={question.fieldName ? (answers[question.fieldName] ?? "") : ""}
          onChange={(value) => {
            if (question.fieldName) setAnswer(question.fieldName, value);
          }}
        />
      );

    case "gapselect":
      return (
        <SelectMissingWordsQuestion
          question={question.text}
          qtextHtml={question.qtextHtml}
          fields={question.selectFields ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case "match":
    case "randomsamatch":
      return (
        <MatchingQuestion
          question={question.text}
          fields={question.selectFields ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case "multianswer":
      return (
        <ClozeQuestion
          parts={question.clozeParts ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case "ordering":
      return (
        <OrderingQuestion
          question={question.text}
          items={question.orderingItems ?? []}
          fieldName={question.orderingFieldName ?? ""}
          setAnswer={setAnswer}
        />
      );

    case "ddwtos":
      return (
        <DragDropTextQuestion
          question={question.text}
          qtextHtml={question.qtextHtml}
          items={question.dragItems ?? []}
          fields={question.dropFields ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case "ddimageortext":
      return (
        <DragDropImageQuestion
          question={question.text}
          image={question.backgroundImage}
          token={token}
          items={question.dragItems ?? []}
          fields={question.dropFields ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case "ddmarker":
      return (
        <DragMarkerQuestion
          question={question.text}
          image={question.backgroundImage}
          items={question.dragItems ?? []}
          fields={question.dropFields ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    default:
      return (
        <View style={styles.error}>
          <Text style={styles.errorTitle}>Chưa hỗ trợ Beauty Render</Text>
          <Text>{question.type}</Text>
          {!!question.text && <Text style={styles.fallbackText}>{question.text}</Text>}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  error: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
  },
  errorTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  fallbackText: {
    marginTop: 10,
    lineHeight: 22,
  },
});
