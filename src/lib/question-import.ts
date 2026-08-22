import type { QuestionInput } from "./tests";

export interface QuestionImportResult {
  questions: QuestionInput[];
  errors: string[];
}

type DraftQuestion = {
  text: string;
  options: string[];
  correctAnswerIndex: number | null;
};

const QUESTION_LABEL = /^(zadání|zadani|otázka|otazka)\s*(?::|-)?\s*(.*)$/i;
const CORRECT_LABEL = /^(správná odpověď|spravna odpoved|správně|spravne)\s*(?::|-)?\s*(.*)$/i;
const WRONG_LABEL = /^(špatná odpověď|spatna odpoved|špatně|spatne)\s*(?::|-)?\s*(.*)$/i;

function cleanValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function normalizeQuestionSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("cs-CZ");
}

export function parseQuestionImport(input: string): QuestionImportResult {
  const questions: QuestionInput[] = [];
  const errors: string[] = [];
  const seenTexts = new Set<string>();
  let draft: DraftQuestion | null = null;
  let activeField: { type: "text" } | { type: "option"; index: number } | null = null;

  const finishDraft = () => {
    if (!draft) return;
    const number = questions.length + 1;
    const text = draft.text.trim();
    const options = draft.options.map((option) => option.trim());

    if (!text) errors.push(`Otázka ${number}: chybí zadání.`);
    if (options.length < 2) errors.push(`Otázka ${number}: musí mít alespoň 2 odpovědi.`);
    if (options.some((option) => !option)) errors.push(`Otázka ${number}: obsahuje prázdnou odpověď.`);
    if (draft.correctAnswerIndex === null) {
      errors.push(`Otázka ${number}: chybí správná odpověď.`);
    }

    const normalizedText = normalizeQuestionSearch(text);
    if (normalizedText && seenTexts.has(normalizedText)) {
      errors.push(`Otázka ${number}: zadání je v importu uvedeno vícekrát.`);
    }

    if (
      text &&
      options.length >= 2 &&
      options.every(Boolean) &&
      draft.correctAnswerIndex !== null &&
      !seenTexts.has(normalizedText)
    ) {
      seenTexts.add(normalizedText);
      questions.push({
        text,
        options,
        correctAnswerIndex: draft.correctAnswerIndex,
      });
    }

    draft = null;
    activeField = null;
  };

  for (const [lineIndex, rawLine] of input.replace(/\r\n?/g, "\n").split("\n").entries()) {
    const line = rawLine.trim();
    if (!line) continue;

    const questionMatch = line.match(QUESTION_LABEL);
    if (questionMatch) {
      finishDraft();
      draft = { text: cleanValue(questionMatch[2]), options: [], correctAnswerIndex: null };
      activeField = { type: "text" };
      continue;
    }

    const correctMatch = line.match(CORRECT_LABEL);
    const wrongMatch = line.match(WRONG_LABEL);
    if (correctMatch || wrongMatch) {
      if (!draft) {
        errors.push(`Řádek ${lineIndex + 1}: odpověď je uvedena před zadáním.`);
        continue;
      }
      const value = cleanValue((correctMatch ?? wrongMatch)![2]);
      const optionIndex = draft.options.push(value) - 1;
      if (correctMatch) {
        if (draft.correctAnswerIndex !== null) {
          errors.push(`Otázka ${questions.length + 1}: má více než jednu správnou odpověď.`);
        } else {
          draft.correctAnswerIndex = optionIndex;
        }
      }
      activeField = { type: "option", index: optionIndex };
      continue;
    }

    if (!draft || !activeField) {
      errors.push(`Řádek ${lineIndex + 1}: nerozpoznaný text „${line}“.`);
      continue;
    }

    if (activeField.type === "text") {
      draft.text = `${draft.text} ${line}`.trim();
    } else {
      draft.options[activeField.index] = `${draft.options[activeField.index]} ${line}`.trim();
    }
  }

  finishDraft();
  if (input.trim() && questions.length === 0 && errors.length === 0) {
    errors.push("Nebyla rozpoznána žádná otázka.");
  }

  return { questions, errors };
}
