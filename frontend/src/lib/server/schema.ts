export type StoredChapter = {
  id: string;
  title: string;
  content: string;
};

export type StoredCourse = {
  id: string;
  title: string;
  topic: string;
  language: string;
  overview: string;
  learning_outcomes: string[];
  chapters: StoredChapter[];
  generated_content: string;
  created_at: string;
};

export type CoursesDatabase = {
  schema_version: 2;
  courses: StoredCourse[];
};

export const EMPTY_DATABASE: CoursesDatabase = {
  schema_version: 2,
  courses: [],
};
