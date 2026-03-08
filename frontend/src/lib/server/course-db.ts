import { promises as fs } from "fs";
import path from "path";
import { EMPTY_DATABASE, type CoursesDatabase, type StoredCourse } from "@/lib/server/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "courses.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(EMPTY_DATABASE, null, 2), "utf8");
  }
}

async function readDatabase(): Promise<CoursesDatabase> {
  await ensureDataFile();

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<CoursesDatabase>;

    if (parsed && Array.isArray(parsed.courses)) {
      return {
        schema_version: 2,
        courses: parsed.courses,
      };
    }

    return EMPTY_DATABASE;
  } catch {
    return EMPTY_DATABASE;
  }
}

async function writeDatabase(db: CoursesDatabase) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function insertCourse(course: StoredCourse): Promise<void> {
  const db = await readDatabase();
  const nextCourses = [course, ...db.courses.filter((item) => item.id !== course.id)];
  await writeDatabase({ schema_version: 2, courses: nextCourses });
}

export async function getCourseById(courseId: string): Promise<StoredCourse | null> {
  const db = await readDatabase();
  return db.courses.find((course) => course.id === courseId) ?? null;
}

export async function listCourses(): Promise<StoredCourse[]> {
  const db = await readDatabase();
  return [...db.courses].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return Number.isFinite(bTime - aTime) ? bTime - aTime : 0;
  });
}

export async function clearCourses(): Promise<void> {
  await writeDatabase(EMPTY_DATABASE);
}
