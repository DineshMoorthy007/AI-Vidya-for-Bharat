/**
 * YouTube Video Search Service
 * Integrates with YouTube Data API v3 to search for educational videos
 * Filters and returns high-quality videos (5-20 minutes) based on course topics and languages
 */

import axios from "axios";

// Video interface matching the required output format
interface VideoResult {
  title: string;
  youtubeId: string;
  thumbnail: string;
  channel: string;
}

// YouTube API response interface
interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface YouTubeVideoDetails {
  items: Array<{
    id: string;
    contentDetails: {
      duration: string;
    };
  }>;
}

/**
 * Map language codes to YouTube supported language codes
 * @param languageCode The language code from the app
 * @returns YouTube compatible language code
 */
function mapToYouTubeLanguage(languageCode: string): string {
  const languageMap: Record<string, string> = {
    en: "en", // English
    hi: "hi", // Hindi
    ta: "ta", // Tamil
    te: "te", // Telugu
    kn: "kn", // Kannada
    ml: "ml", // Malayalam
    bn: "bn", // Bengali
    gu: "gu", // Gujarati
    mr: "mr", // Marathi
    pa: "pa", // Punjabi
    or: "or", // Odia
    as: "as", // Assamese
    ur: "ur", // Urdu
    // Add more language mappings as needed
  };

  return languageMap[languageCode] || "en"; // Default to English
}

/**
 * Convert ISO 8601 duration to seconds
 * @param duration ISO 8601 duration string (e.g., PT15M30S)
 * @returns Duration in seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Check if video duration is within acceptable range (5-20 minutes)
 * @param durationSeconds Duration in seconds
 * @returns true if video is between 5 and 20 minutes
 */
function isValidDuration(durationSeconds: number): boolean {
  const minSeconds = 5 * 60; // 5 minutes
  const maxSeconds = 20 * 60; // 20 minutes
  return durationSeconds >= minSeconds && durationSeconds <= maxSeconds;
}

/**
 * Fetch video details (including duration) from YouTube API
 * @param videoIds Comma-separated video IDs
 * @returns Map of video ID to video details
 */
async function fetchVideoDetails(
  videoIds: string[],
): Promise<Map<string, YouTubeVideoDetails["items"][0]>> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }

  try {
    const response = await axios.get<YouTubeVideoDetails>(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "contentDetails",
          id: videoIds.join(","),
          key: apiKey,
        },
      },
    );

    const detailsMap = new Map();
    response.data.items.forEach((item) => {
      detailsMap.set(item.id, item);
    });

    return detailsMap;
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw new Error("Failed to fetch video details from YouTube API");
  }
}

/**
 * Search for educational videos on YouTube
 * @param searchQuery The topic or query to search for (can include topic and language)
 * @param language The language code for video relevance (e.g., 'en', 'hi', 'ta')
 * @param maxResults Maximum number of results to fetch initially (before filtering)
 * @returns Array of top 3 high-quality videos matching the query
 */
async function searchEducationalVideos(
  searchQuery: string,
  language: string = "en",
  maxResults: number = 10,
): Promise<VideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }

  if (!searchQuery || searchQuery.trim().length === 0) {
    throw new Error("Search query is required");
  }

  try {
    // Map language code to YouTube supported language
    const youtubeLanguage = mapToYouTubeLanguage(language);

    // Search for videos
    const searchResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: searchQuery.includes("educational tutorial")
            ? searchQuery
            : `${searchQuery} educational tutorial`, // Add "educational" to filter better content if not already included
          type: "video",
          maxResults,
          relevanceLanguage: youtubeLanguage, // Use the mapped language code
          order: "relevance",
          videoDuration: "medium", // Filters videos between 4 and 20 minutes
          key: apiKey,
        },
      },
    );

    const searchItems: YouTubeSearchItem[] = searchResponse.data.items || [];

    if (searchItems.length === 0) {
      console.warn(`No videos found for query: ${searchQuery}`);
      return [];
    }

    // Extract video IDs for detail fetching
    const videoIds = searchItems.map((item) => item.id.videoId);

    // Fetch video details (including duration) for filtering
    const videoDetailsMap = await fetchVideoDetails(videoIds);

    // Map search results and filter by duration
    const videos: VideoResult[] = [];

    for (const item of searchItems) {
      const videoId = item.id.videoId;
      const details = videoDetailsMap.get(videoId);

      if (!details) continue;

      const durationSeconds = parseDuration(details.contentDetails.duration);

      // Only include videos within 5-20 minute range
      if (isValidDuration(durationSeconds)) {
        videos.push({
          title: item.snippet.title,
          youtubeId: videoId,
          thumbnail: item.snippet.thumbnails.medium.url,
          channel: item.snippet.channelTitle,
        });
      }
    }

    // Return top 3 results
    return videos.slice(0, 3);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "YouTube API Error:",
        error.response?.data || error.message,
      );
      throw new Error(
        `YouTube API error: ${error.response?.data?.error?.message || error.message}`,
      );
    }
    throw error;
  }
}

export { searchEducationalVideos, VideoResult };
