import { Markup } from "telegraf";
import { addNavigation } from "./navigation";

export type Grade = 9 | 10 | 11 | 12;

// Subjects for grades 9–10 (no stream)
const commonSubjects: Record<9 | 10, string[]> = {
  9: ["Mathematics", "Physics", "Biology", "Chemistry", "English"],
  10: ["Mathematics", "Physics", "Civics", "ICT", "English"],
};

// Streams for 11–12
const streamSubjects: Record<11 | 12, { natural: string[]; social: string[] }> = {
  11: {
    natural: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Technical Drawing"],
    social:  ["Mathematics", "Geography", "History", "Civics", "Economics", "English"],
  },
  12: {
    natural: ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
    social:  ["Mathematics", "Geography", "History", "Economics", "Civics", "English"],
  },
};

// Menu when user selects grade is 9 or 10 → direct subjects
export const subjectMenu = (grade: Grade) => {
  if (grade === 9 || grade === 10) {
    const list = commonSubjects[grade];
    const buttons = list.map((subj) =>
      [Markup.button.callback(`📚 ${subj}`, `subject_${grade}_${subj}`)]
    );
    return Markup.inlineKeyboard(addNavigation(buttons));
  }

  // Grades 11 or 12 → first choose stream
  const buttons = [
    [
      Markup.button.callback("🌿 Natural Science", `stream_${grade}_natural`),
      Markup.button.callback("🏛 Social Science", `stream_${grade}_social`),
    ],
  ];

  return Markup.inlineKeyboard(addNavigation(buttons));
};

// New function: called after user picks a stream (in your scene/handler)
export const subjectsAfterStream = (grade: 11 | 12, stream: "natural" | "social") => {
  const list = streamSubjects[grade][stream];

  const buttons = list.map((subj) =>[
    Markup.button.callback(`📚 ${subj}`, `subject_${grade}_${subj}`)]
  );

  return Markup.inlineKeyboard(addNavigation(buttons));
};