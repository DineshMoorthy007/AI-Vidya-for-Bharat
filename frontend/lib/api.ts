export type Chapter = {
  id: string;
  title: string;
  explanation: string;
  content?: string;
};

export type Course = {
  id: string;
  topic: string;
  language: string;
  title: string;
  chapters: Chapter[];
  overview?: string;
  summary?: string;
  learning_outcomes?: string[];
  learningOutcomes?: string[];
  createdAt?: string;
};

export type CourseListItem = {
  id: string;
  title: string;
  topic: string;
  language: string;
  createdAt?: string;
};

type GenerateCourseResponse = {
  courseId: string;
};

type ChatResponse = {
  reply: string;
};

export type ChatContext = {
  chapter?: string;
  tool?: string;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

function dispatchCoursesUpdatedEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("courses-updated"));
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let errorMessage = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as {
      error?: string;
      message?: string;
    };
    errorMessage = body.error || body.message || errorMessage;
  } catch {
    // Keep fallback error message if body is not JSON.
  }

  throw new Error(errorMessage);
}

function normalizeChapter(
  chapter: {
    id?: string;
    title?: string;
    explanation?: string;
    content?: string;
  },
  index: number,
): Chapter {
  const content = chapter.content ?? chapter.explanation ?? "";

  return {
    id: chapter.id ?? `chapter-${index + 1}`,
    title: chapter.title ?? `Chapter ${index + 1}`,
    content,
    explanation: chapter.explanation ?? content,
  };
}

function normalizeCourse(
  payload: Partial<Course> & { created_at?: string },
): Course {
  return {
    id: payload.id ?? "",
    title: payload.title ?? "Untitled Course",
    topic: payload.topic ?? "General Topic",
    language: payload.language ?? "en",
    overview: payload.overview,
    summary: payload.summary,
    learning_outcomes: payload.learning_outcomes,
    learningOutcomes: payload.learningOutcomes,
    createdAt: payload.createdAt ?? payload.created_at,
    chapters: Array.isArray(payload.chapters)
      ? payload.chapters.map((chapter, index) =>
          normalizeChapter(chapter, index),
        )
      : [],
  };
}

export async function generateCourse(
  topic: string,
  language: string,
): Promise<GenerateCourseResponse> {
  const response = await fetch(buildApiUrl("/api/generate-course"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic, language }),
    cache: "no-store",
  });

  const payload = await parseJsonResponse<GenerateCourseResponse>(response);

  if (!payload.courseId) {
    throw new Error("Backend did not return courseId");
  }

  dispatchCoursesUpdatedEvent();
  return payload;
}

export async function fetchCourse(courseId: string): Promise<Course> {
  const response = await fetch(
    buildApiUrl(`/api/course/${encodeURIComponent(courseId)}`),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const payload = await parseJsonResponse<
    | (Partial<Course> & { created_at?: string })
    | { course: Partial<Course> & { created_at?: string } }
  >(response);
  const course = "course" in payload ? payload.course : payload;
  return normalizeCourse(course);
}

export async function fetchCourses(): Promise<CourseListItem[]> {
  const response = await fetch(buildApiUrl("/api/courses"), {
    method: "GET",
    cache: "no-store",
  });

  const payload = await parseJsonResponse<
    | Array<{
        id: string;
        title: string;
        topic: string;
        language: string;
        createdAt?: string;
        created_at?: string;
      }>
    | {
        courses: Array<{
          id: string;
          title: string;
          topic: string;
          language: string;
          createdAt?: string;
          created_at?: string;
        }>;
      }
  >(response);

  const courses = Array.isArray(payload) ? payload : payload.courses;

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    topic: course.topic,
    language: course.language,
    createdAt: course.createdAt ?? course.created_at,
  }));
}

export async function deleteCourses(): Promise<void> {
  const response = await fetch(buildApiUrl("/api/courses"), {
    method: "DELETE",
    cache: "no-store",
  });

  await parseJsonResponse<{ message?: string }>(response);
  dispatchCoursesUpdatedEvent();
}

export async function sendChatMessage(
  message: string,
  courseId: string,
  context?: ChatContext,
): Promise<ChatResponse> {
  const response = await fetch(buildApiUrl("/api/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      courseId,
      chapter: context?.chapter,
      tool: context?.tool,
    }),
    cache: "no-store",
  });

  return parseJsonResponse<ChatResponse>(response);
}

// Backward-compatible aliases for existing imports.
export const getCourse = fetchCourse;
export const getCourses = fetchCourses;
export const clearAllCourses = deleteCourses;
export const chatWithGuru = sendChatMessage;
