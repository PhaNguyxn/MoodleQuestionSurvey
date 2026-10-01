export type QuestionType =
  | "description"
  | "multichoice-single"
  | "multichoice-multiple"
  | "truefalse"
  | "gapselect"
  | "shortanswer"
  | "essay"
  | "match"
  | "randomsamatch"
  | "ddwtos"
  | "ddimageortext"
  | "ddmarker"
  | "numerical"
  | "calculated"
  | "calculatedsimple"
  | "calculatedmulti"
  | "multianswer"
  | "ordering"
  | "unknown";

export interface Choice {
  label: string;
  value: string;
  fieldName?: string;
}

export interface SelectField {
  fieldName: string;
  label?: string;
  choices: Choice[];
}

export interface ClozePart {
  type: "text" | "input";
  text?: string;
  fieldName?: string;
}

export interface OrderingItem {
  id: string;
  text: string;
}

export interface DragItem {
  id: string;
  text: string;
  choice?: number;
}

export interface DropField {
  place: number;
  fieldName: string;
}

export interface ParsedQuestion {
  type: QuestionType;
  text: string;
  html: string;
  qtextHtml?: string;

  fieldName?: string;
  answerFormatField?: string;
  answerFormatValue?: string;

  choices?: Choice[];
  selectFields?: SelectField[];
  clozeParts?: ClozePart[];

  orderingItems?: OrderingItem[];
  orderingFieldName?: string;

  dragItems?: DragItem[];
  dropFields?: DropField[];

  backgroundImage?: string;
}
