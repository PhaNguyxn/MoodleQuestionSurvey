import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ParsedQuestion } from "../types/question";

import DescriptionQuestion from "./DescriptionQuestion";
import SingleChoiceQuestion from "./SingleChoiceQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import TextQuestion from "./TextQuestion";
import EssayQuestion from "./EssayQuestion";
import SelectMissingWordsQuestion from "./SelectMissingWordsQuestion";
import MatchingQuestion from "./MatchingQuestion";
import ClozeQuestion from "./ClozeQuestion";
import OrderingQuestion from "./OrderingQuestion";
import DragDropTextQuestion from "./DragDropTextQuestion";
import DragDropImageQuestion from "./DragDropImageQuestion";
import DragMarkerQuestion from "./DragMarkerQuestion";

interface Props {
  question: ParsedQuestion;

  answers: Record<string, string>;

  setAnswer: (field: string, value: string) => void;
}

export default function QuestionRenderer({
  question,
  answers,
  setAnswer,
}: Props) {
  switch (question.type) {
    case "description":
      return <DescriptionQuestion text={question.text} />;

    case "multichoice-single":
    case "truefalse":
    case "calculatedmulti":
      return (
        <SingleChoiceQuestion
          question={question.text}
          choices={question.choices ?? []}
          value={question.fieldName ? answers[question.fieldName] : undefined}
          onChange={(value) => {
            if (!question.fieldName) {
              return;
            }

            setAnswer(question.fieldName, value);
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
            if (question.fieldName) {
              setAnswer(question.fieldName, value);
            }
          }}
        />
      );

    case "numerical":
    case "calculated":
      return (
        <TextQuestion
          question={question.text}
          numeric
          value={question.fieldName ? (answers[question.fieldName] ?? "") : ""}
          onChange={(value) => {
            if (question.fieldName) {
              setAnswer(question.fieldName, value);
            }
          }}
        />
      );

    case "essay":
      return (
        <EssayQuestion
          question={question.text}
          value={question.fieldName ? (answers[question.fieldName] ?? "") : ""}
          onChange={(value) => {
            if (question.fieldName) {
              setAnswer(question.fieldName, value);
            }
          }}
        />
      );

    case "gapselect":
      return (
        <SelectMissingWordsQuestion
          question={question.text}
          fields={question.selectFields ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case "match":
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
          <Text>Chưa hỗ trợ Beauty Render: {question.type}</Text>
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
});
