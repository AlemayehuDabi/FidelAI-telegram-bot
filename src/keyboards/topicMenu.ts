import { Markup } from "telegraf";
import { addNavigation } from "./navigation";

const TOPICS: Record<string, string[]> = {
  Mathematics: ["Algebra", "Geometry", "Functions", "Calculus Basics"],
  Physics: ["Motion", "Force", "Energy", "Waves"],
  Chemistry: ["Atoms", "Periodic Table", "Bonding"],
  Biology: ["Cells", "Genetics", "Ecology"],
  English: ["Grammar", "Writing", "Vocabulary"],
};

export const topicMenu = (grade: number, subject: string) => {
  const topics = TOPICS[subject] || [];

  const buttons = topics.map((topic) => [
    Markup.button.callback(`📖 ${topic}`, `topic_${grade}_${subject}_${topic}`)
  ]);

  return Markup.inlineKeyboard(addNavigation(buttons));
};
