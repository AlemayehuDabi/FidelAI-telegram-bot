import fetch from "node-fetch";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

export interface YouTubeVideo {
  title: string;
  videoId: string;
  url: string;
  thumbnail: string;
  channelTitle: string;
}

/**
 * Search YouTube for educational videos
 * Returns top 5 videos
 */
export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY not set. YouTube search will not work.");
    return [];
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&safeSearch=strict`;

    const response = await fetch(searchUrl);
    const data = await response.json() as any;

    if (data.error) {
      console.error("YouTube API Error:", data.error);
      return [];
    }

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return [];
  }
}

/**
 * Format YouTube videos as a Telegram message
 */
export function formatYouTubeVideos(videos: YouTubeVideo[]): string {
  if (videos.length === 0) {
    return "❌ No videos found. Please try a different search query.";
  }

  let message = "🎥 <b>Top Educational Videos:</b>\n\n";
  
  videos.forEach((video, index) => {
    message += `${index + 1}. <a href="${video.url}">${video.title}</a>\n`;
    message += `   📺 ${video.channelTitle}\n\n`;
  });

  return message;
}

