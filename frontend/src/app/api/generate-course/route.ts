import { NextResponse } from "next/server";
import { buildGeneratedCourse } from "@/lib/server/course-generator";
import { insertCourse } from "@/lib/server/course-db";

type GenerateCourseBody = {
  topic?: string;
  language?: string;
};

function toClientCourse(storedCourse: ReturnType<typeof buildGeneratedCourse>) {
  return {
    id: storedCourse.id,
    title: storedCourse.title,
    topic: storedCourse.topic,
    language: storedCourse.language,
    overview: storedCourse.overview,
    learning_outcomes: storedCourse.learning_outcomes,
    chapters: storedCourse.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      content: chapter.content,
      explanation: chapter.content,
    })),
    createdAt: storedCourse.created_at,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateCourseBody;
    const topic = body.topic?.trim() ?? "";
    const language = body.language?.trim() ?? "en";

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const storedCourse = buildGeneratedCourse({ topic, language });
    await insertCourse(storedCourse);

    return NextResponse.json({
      id: storedCourse.id,
      course: toClientCourse(storedCourse),
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate course" }, { status: 500 });
  }
}
