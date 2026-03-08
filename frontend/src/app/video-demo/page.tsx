/**
 * Video Search Demo Page
 * Add this route to your Next.js app to test video search functionality
 *
 * Usage: Navigate to /video-demo in your browser
 */

import VideoSearchDemo from "@/components/VideoSearchDemo";

export default function VideoDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <VideoSearchDemo />
    </div>
  );
}
