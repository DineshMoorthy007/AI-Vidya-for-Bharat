import { NextResponse } from "next/server";
import { getCourseById } from "@/lib/server/course-db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const storedCourse = await getCourseById(id);

    if (!storedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      course: {
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
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load course" }, { status: 500 });
  }
}
