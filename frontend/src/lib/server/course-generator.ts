import type { StoredChapter, StoredCourse } from "@/lib/server/schema";

type BuildGeneratedCourseInput = {
  topic: string;
  language: string;
};

function toSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return slug || "custom-topic";
}

function makeId(topic: string) {
  return `course-${toSlug(topic)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildGeneratedCourse({ topic, language }: BuildGeneratedCourseInput): StoredCourse {
  const cleanTopic = topic.trim();
  const cleanLanguage = language.trim() || "en";
  const id = makeId(cleanTopic);

  const overview = `${cleanTopic} is explained in a practical, beginner-friendly path with examples and chapter-wise progression in ${cleanLanguage}.`;

  const learningOutcomes = [
    `Understand the core fundamentals of ${cleanTopic}`,
    `Break down important concepts into easy mental models`,
    `Apply ${cleanTopic} in common real-world scenarios`,
    `Build confidence through progressive chapter exercises`,
  ];

  const chapters: StoredChapter[] = [
    {
      id: `${id}-chapter-1`,
      title: `Introduction to ${cleanTopic}`,
      content: `${cleanTopic} starts with understanding why it matters, where it is used, and how beginners can approach it without confusion.`,
    },
    {
      id: `${id}-chapter-2`,
      title: `Core Concepts of ${cleanTopic}`,
      content: `This chapter explains the building blocks of ${cleanTopic} with small examples and intuitive step-by-step breakdowns.`,
    },
    {
      id: `${id}-chapter-3`,
      title: `Practice Applications of ${cleanTopic}`,
      content: `Use practical scenarios to apply ${cleanTopic}, identify mistakes, and improve with guided practice patterns.`,
    },
    {
      id: `${id}-chapter-4`,
      title: `${cleanTopic} in Real Projects`,
      content: `Learn how ${cleanTopic} appears in real products, how to reason through trade-offs, and how to continue learning independently.`,
    },
  ];

  return {
    id,
    title: `${cleanTopic} (${cleanLanguage})`,
    topic: cleanTopic,
    language: cleanLanguage,
    overview,
    learning_outcomes: learningOutcomes,
    chapters,
    generated_content: JSON.stringify({
      overview,
      learning_outcomes: learningOutcomes,
      chapters,
    }),
    created_at: new Date().toISOString(),
  };
}
