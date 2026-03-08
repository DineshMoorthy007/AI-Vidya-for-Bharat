import { NextResponse } from "next/server";
import { clearCourses, listCourses } from "@/lib/server/course-db";

export async function GET() {
  try {
    const courses = await listCourses();

    return NextResponse.json({
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        topic: course.topic,
        language: course.language,
        createdAt: course.created_at,
      })),
    });
  } catch {
    return NextResponse.json({ courses: [] }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearCourses();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to clear courses" }, { status: 500 });
  }
}
