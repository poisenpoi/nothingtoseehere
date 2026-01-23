"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Play } from "lucide-react";

interface ModuleContentProps {
  moduleId: string;
  contentUrl: string;
  isCompleted: boolean;
  courseSlug: string;
  nextItemSlug?: string;
}

export default function ModuleContent({
  moduleId,
  contentUrl,
  isCompleted,
  courseSlug,
  nextItemSlug,
}: ModuleContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [error, setError] = useState<string | null>(null);

  const isVideo = /\.(mp4|webm|ogg)$/i.test(contentUrl);
  const isYouTube =
    contentUrl.includes("youtube.com") || contentUrl.includes("youtu.be");
  const isVimeo = contentUrl.includes("vimeo.com");
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(contentUrl);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] ?? "";
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1] ?? "";
    return `https://player.vimeo.com/video/${videoId}`;
  };

  const handleMarkComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/modules/${moduleId}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to mark as complete");
      }

      setCompleted(true);
      router.refresh();

      // Navigate to next item if available
      if (nextItemSlug) {
        setTimeout(() => {
          router.push(`/courses/${courseSlug}/${nextItemSlug}`);
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Content Display */}
      <div className="aspect-video bg-slate-900 relative">
        {isVideo && (
          <video
            src={contentUrl}
            controls
            className="w-full h-full object-contain"
            poster="/thumbnail.jpeg"
          >
            Your browser does not support the video tag.
          </video>
        )}

        {isYouTube && (
          <iframe
            src={getYouTubeEmbedUrl(contentUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {isVimeo && (
          <iframe
            src={getVimeoEmbedUrl(contentUrl)}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}

        {isImage && (
          <img
            src={contentUrl}
            alt="Module content"
            className="w-full h-full object-contain"
          />
        )}

        {!isVideo && !isYouTube && !isVimeo && !isImage && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Play className="w-16 h-16 mx-auto mb-4" />
              <p>Content preview not available</p>
              <a
                href={contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline mt-2 inline-block"
              >
                Open content in new tab
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {completed ? (
              <span className="flex items-center gap-2 text-emerald-600 font-medium">
                <CheckCircle className="w-5 h-5" />
                You have completed this lesson
              </span>
            ) : (
              <span>Watch the video and mark as complete when you're done</span>
            )}
          </div>

          {!completed && (
            <button
              onClick={handleMarkComplete}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Mark as Complete
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
