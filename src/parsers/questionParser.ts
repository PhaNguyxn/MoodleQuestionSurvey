import { HTMLElement, parse } from "node-html-parser";

import {
  Choice,
  ClozePart,
  DragItem,
  DropField,
  OrderingItem,
  ParsedQuestion,
  QuestionType,
  SelectField,
} from "../types/question";

function cleanText(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectType(html: string): QuestionType {
  if (html.includes("que description")) {
    return "description";
  }

  if (html.includes("que truefalse")) {
    return "truefalse";
  }

  if (html.includes("que gapselect")) {
    return "gapselect";
  }

  if (html.includes("que shortanswer")) {
    return "shortanswer";
  }

  if (html.includes("que essay")) {
    return "essay";
  }

  if (html.includes("que match")) {
    return "match";
  }

  if (html.includes("que ddwtos")) {
    return "ddwtos";
  }

  if (html.includes("que ddimageortext")) {
    return "ddimageortext";
  }

  if (html.includes("que ddmarker")) {
    return "ddmarker";
  }

  if (html.includes("que numerical")) {
    return "numerical";
  }

  // Phải kiểm tra calculatedmulti trước calculated.
  if (html.includes("que calculatedmulti")) {
    return "calculatedmulti";
  }

  if (html.includes("que calculated ")) {
    return "calculated";
  }

  if (html.includes("que multianswer")) {
    return "multianswer";
  }

  if (html.includes("que ordering")) {
    return "ordering";
  }

  if (html.includes("que multichoice")) {
    if (html.includes('type="checkbox"')) {
      return "multichoice-multiple";
    }

    return "multichoice-single";
  }

  return "unknown";
}

function parseRadioChoices(root: HTMLElement): {
  fieldName?: string;
  choices: Choice[];
} {
  const inputs = root.querySelectorAll('.answer input[type="radio"]');

  const choices: Choice[] = [];
  let fieldName: string | undefined;

  inputs.forEach((input) => {
    const value = input.getAttribute("value") ?? "";
    const name = input.getAttribute("name") ?? "";
    const id = input.getAttribute("id") ?? "";

    // Bỏ Clear my choice.
    if (value === "-1") {
      return;
    }

    if (!fieldName) {
      fieldName = name;
    }

    const labelId = input.getAttribute("aria-labelledby");

    let label = "";

    if (labelId) {
      const labelElement = root.querySelector(`#${labelId}`);

      label = cleanText(labelElement?.text);
    }

    // True/False dùng <label for="">.
    if (!label && id) {
      const labelElement = root.querySelector(`label[for="${id}"]`);

      label = cleanText(labelElement?.text);
    }

    // Bỏ a., b., c. ở đầu nếu có.
    label = label.replace(/^[a-zA-Z]\.\s*/, "");

    choices.push({
      label,
      value,
      fieldName: name,
    });
  });

  return {
    fieldName,
    choices,
  };
}

function parseCheckboxChoices(root: HTMLElement): Choice[] {
  const inputs = root.querySelectorAll('.answer input[type="checkbox"]');

  return inputs.map((input) => {
    const fieldName = input.getAttribute("name") ?? "";

    const value = input.getAttribute("value") ?? "1";

    const labelId = input.getAttribute("aria-labelledby");

    let label = "";

    if (labelId) {
      label = cleanText(root.querySelector(`#${labelId}`)?.text);
    }

    label = label.replace(/^[a-zA-Z]\.\s*/, "");

    return {
      label,
      value,
      fieldName,
    };
  });
}

function parseTextInput(root: HTMLElement): string | undefined {
  const input = root.querySelector(
    '.answer input[type="text"], .ablock input[type="text"]',
  );

  return input?.getAttribute("name") ?? undefined;
}

function parseSelectFields(root: HTMLElement): SelectField[] {
  const selects = root.querySelectorAll("select");

  return selects.map((select) => {
    const fieldName = select.getAttribute("name") ?? "";

    let label = "";

    const row = select.closest("tr");

    if (row) {
      const textCell = row.querySelector(".text");

      label = cleanText(textCell?.text);
    }

    const choices: Choice[] = select
      .querySelectorAll("option")
      .map((option) => ({
        label: cleanText(option.text),
        value: option.getAttribute("value") ?? "",
      }));

    return {
      fieldName,
      label,
      choices,
    };
  });
}

function parseOrdering(root: HTMLElement): {
  items: OrderingItem[];
  fieldName?: string;
} {
  const items = root.querySelectorAll(".sortableitem").map((item) => {
    const id = item.getAttribute("id") ?? "";

    const content = item.querySelector("[data-itemcontent]");

    return {
      id,
      text: cleanText(content?.text),
    };
  });

  const hidden = root.querySelector('input[type="hidden"][name*="_response_"]');

  return {
    items,
    fieldName: hidden?.getAttribute("name") ?? undefined,
  };
}

function parseDragDropText(root: HTMLElement): {
  items: DragItem[];
  fields: DropField[];
} {
  const dragHomes = root.querySelectorAll(".draghome");

  const items: DragItem[] = dragHomes.map((element, index) => ({
    id: `choice-${index + 1}`,
    choice: index + 1,
    text: cleanText(element.text),
  }));

  const inputs = root.querySelectorAll('input.placeinput[type="hidden"]');

  const fields: DropField[] = inputs.map((input, index) => ({
    place: index + 1,
    fieldName: input.getAttribute("name") ?? "",
  }));

  return {
    items,
    fields,
  };
}

function parseDragImage(root: HTMLElement): {
  image?: string;
  items: DragItem[];
  fields: DropField[];
} {
  const imageElement = root.querySelector("img.dropbackground");

  const image = imageElement?.getAttribute("src") ?? undefined;

  const dragHomes = root.querySelectorAll(".draghomes .draghome");

  const items: DragItem[] = dragHomes.map((element, index) => ({
    id: `choice-${index + 1}`,
    choice: index + 1,
    text: cleanText(element.text),
  }));

  const inputs = root.querySelectorAll('input.placeinput[type="hidden"]');

  const fields: DropField[] = inputs.map((input, index) => ({
    place: index + 1,
    fieldName: input.getAttribute("name") ?? "",
  }));

  return {
    image,
    items,
    fields,
  };
}

function parseMarkers(root: HTMLElement): {
  image?: string;
  items: DragItem[];
  fields: DropField[];
} {
  const image =
    root.querySelector("img.dropbackground")?.getAttribute("src") ?? undefined;

  const markers = root.querySelectorAll(".draghomes .marker");

  const items: DragItem[] = markers.map((marker, index) => ({
    id: `marker-${index + 1}`,
    choice: index + 1,
    text: cleanText(marker.querySelector(".markertext")?.text),
  }));

  const inputs = root.querySelectorAll('.ddform input[type="hidden"]');

  const fields: DropField[] = inputs.map((input, index) => ({
    place: index + 1,
    fieldName: input.getAttribute("name") ?? "",
  }));

  return {
    image,
    items,
    fields,
  };
}

/**
 * Parser Cloze đơn giản cho response hiện tại:
 * text + <span class="subquestion"><input .../></span>
 */
function parseCloze(root: HTMLElement): ClozePart[] {
  const formulation = root.querySelector(".formulation");

  if (!formulation) return [];

  const paragraph = formulation.querySelector("p");

  if (!paragraph) return [];

  const parts: ClozePart[] = [];

  paragraph.childNodes.forEach((node: any) => {
    // Text node
    if (node.nodeType === 3) {
      const text = node.rawText ?? "";

      if (text) {
        parts.push({
          type: "text",
          text,
        });
      }

      return;
    }

    const element = node as HTMLElement;

    if (element.classNames?.includes("subquestion")) {
      const input = element.querySelector("input");

      const fieldName = input?.getAttribute("name");

      if (fieldName) {
        parts.push({
          type: "input",
          fieldName,
        });
      }

      return;
    }

    const text = element.text;

    if (text) {
      parts.push({
        type: "text",
        text,
      });
    }
  });

  return parts;
}

export function parseQuestion(html: string): ParsedQuestion {
  const root = parse(html);

  const type = detectType(html);

  const qtext = root.querySelector(".qtext");

  const text = cleanText(qtext?.text);

  const result: ParsedQuestion = {
    type,
    text,
    html,
  };

  switch (type) {
    case "multichoice-single":
    case "truefalse":
    case "calculatedmulti": {
      const parsed = parseRadioChoices(root);

      result.fieldName = parsed.fieldName;

      result.choices = parsed.choices;

      break;
    }

    case "multichoice-multiple": {
      result.choices = parseCheckboxChoices(root);

      break;
    }

    case "shortanswer":
    case "numerical":
    case "calculated": {
      result.fieldName = parseTextInput(root);

      break;
    }

    case "essay": {
      const textarea = root.querySelector("textarea");

      result.fieldName = textarea?.getAttribute("name") ?? undefined;

      const format = root.querySelector(
        'input[type="hidden"][name$="_answerformat"]',
      );

      result.answerFormatField = format?.getAttribute("name") ?? undefined;

      result.answerFormatValue = format?.getAttribute("value") ?? undefined;

      break;
    }

    case "gapselect":
    case "match": {
      result.selectFields = parseSelectFields(root);

      break;
    }

    case "multianswer": {
      result.clozeParts = parseCloze(root);

      break;
    }

    case "ordering": {
      const parsed = parseOrdering(root);

      result.orderingItems = parsed.items;

      result.orderingFieldName = parsed.fieldName;

      break;
    }

    case "ddwtos": {
      const parsed = parseDragDropText(root);

      result.dragItems = parsed.items;

      result.dropFields = parsed.fields;

      break;
    }

    case "ddimageortext": {
      const parsed = parseDragImage(root);

      result.backgroundImage = parsed.image;

      result.dragItems = parsed.items;

      result.dropFields = parsed.fields;

      break;
    }

    case "ddmarker": {
      const parsed = parseMarkers(root);

      result.backgroundImage = parsed.image;

      result.dragItems = parsed.items;

      result.dropFields = parsed.fields;

      break;
    }
  }

  return result;
}
