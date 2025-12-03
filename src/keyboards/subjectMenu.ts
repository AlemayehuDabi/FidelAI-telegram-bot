import { Markup } from "telegraf";
import { addNavigation } from "./navigation";
export type Grade = 9 | 10 | 11 | 12;

const subjects = {
  9: ["Mathematics", "Physics", "Biology", "Chemistry", "English"],
  10: ["Mathematics", "Physics", "Civics", "ICT", "English"],
  11: ["Mathematics", "Biology", "Geography", "History", "English"],
  12: ["Mathematics", "Chemistry", "Physics", "Economics", "English"],
};

export const subjectMenu = (grade: Grade) => {
  const list = subjects[grade] || [];

  const buttons = list.map((subj: string) => [
    Markup.button.callback(`📚 ${subj}`, `subject_${grade}_${subj}`)
  ]);

  return Markup.inlineKeyboard(addNavigation(buttons));
};
