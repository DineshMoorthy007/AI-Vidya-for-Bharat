/**
 * API Route: Video Search
 * Endpoint to search for educational videos for a chapter
 * GET /api/videos/search?chapter=<chapter_title>
 */

import { searchEducationalVideos } from "@/services/videoSearch";

/**
 * GET handler for video search
 * Query params:
 *   - chapter: (required) The chapter title to search for
 *   - limit: (optional) Maximum results (default: 3)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapter = searchParams.get("chapter");
    const limit = parseInt(searchParams.get("limit") || "3");

    // Validate input
    if (!chapter || chapter.trim().length === 0) {
      return Response.json(
        { error: "Chapter title is required" },
        { status: 400 },
      );
    }

    if (limit < 1 || limit > 10) {
      return Response.json(
        { error: "Limit must be between 1 and 10" },
        { status: 400 },
      );
    }

    // Search for videos
    const videos = await searchEducationalVideos(chapter);

    // Return limited results
    return Response.json(
      {
        success: true,
        chapter,
        videos: videos.slice(0, limit),
        count: Math.min(videos.length, limit),
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      },
    );
  } catch (error) {
    console.error("Video search error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";

    return Response.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

/**
 * HEAD handler - Check if service is available
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
}
