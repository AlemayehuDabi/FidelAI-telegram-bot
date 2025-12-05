import { Markup } from "telegraf";
import { addNavigation } from "./navigation";

export type Grade = 9 | 10 | 11 | 12;

// Subjects for grades 9–10 (no stream)
const commonSubjects: Record<9 | 10, string[]> = {
  9: ["Amharic","Mathematics", "Physics", "Biology", "Chemistry", "English", "ICT", "Citizenship Education", "Economics", "History", "Geography"],
  10: ["Amharic","Mathematics", "Physics", "Biology", "Chemistry", "English", "ICT", "Citizenship Education", "Economics", "Geography", "History"],
};

// Streams for 11–12
const streamSubjects: Record<11 | 12, { natural: string[]; social: string[] }> = {
  11: {
    natural: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Technical Drawing"],
    social:  ["Mathematics", "Geography", "History", "Civics", "Economics", "English"],
  },
  12: {
    natural: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Technical Drawing"],
    social:  ["Mathematics", "Geography", "History", "Economics", "Civics", "English"],
  },
};

/**
 * Organizes subjects into a mobile-friendly grid layout
 * Groups subjects in rows of 2 for better tap targets
 */
const organizeSubjectsInGrid = (subjects: string[], grade: Grade) => {
  const buttons: any[][] = [];
  
  // Process subjects in pairs for 2-column layout
  for (let i = 0; i < subjects.length; i += 2) {
    const row: any[] = [];
    row.push(Markup.button.callback(`📚 ${subjects[i]!}`, `subject_${grade}_${subjects[i]!}`));
    
    // Add second button if exists
    if (i + 1 < subjects.length) {
      row.push(Markup.button.callback(`📚 ${subjects[i + 1]!}`, `subject_${grade}_${subjects[i + 1]!}`));
    }
    
    buttons.push(row);
  }
  
  return buttons;
};

// Menu when user selects grade is 9 or 10 → direct subjects
export const subjectMenu = (grade: Grade) => {
  if (grade === 9 || grade === 10) {
    const list = commonSubjects[grade];
    const buttons = organizeSubjectsInGrid(list, grade);
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

/**
 * Subjects menu after stream selection (Grades 11-12)
 * Organized in mobile-friendly grid layout
 */
export const subjectsAfterStream = (grade: 11 | 12, stream: "natural" | "social") => {
  const list = streamSubjects[grade][stream];
  const buttons = organizeSubjectsInGrid(list, grade);
  
  return Markup.inlineKeyboard(addNavigation(buttons));
};