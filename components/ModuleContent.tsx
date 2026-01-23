"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { ModuleDetailUI } from "@/lib/data/courseItems";

interface ModuleContentProps {
  module: ModuleDetailUI;
  courseSlug: string;
  nextItemSlug: string | null;
}

export default function ModuleContent({
  module,
  courseSlug,
  nextItemSlug,
}: ModuleContentProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(module.isCompleted);
  const [error, setError] = useState<string | null>(null);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/modules/${module.id}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to mark as complete");
      }

      setIsCompleted(true);

      // Navigate to next item or refresh to show updated state
      if (nextItemSlug) {
        router.push(`/courses/${courseSlug}/${nextItemSlug}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  // Check if contentUrl is a video URL (YouTube, Vimeo, or direct video)
  const isYouTube =
    module.contentUrl.includes("youtube.com") ||
    module.contentUrl.includes("youtu.be");
  const isVimeo = module.contentUrl.includes("vimeo.com");
  const isDirectVideo =
    module.contentUrl.endsWith(".mp4") ||
    module.contentUrl.endsWith(".webm") ||
    module.contentUrl.endsWith(".ogg");

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] || "";
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1] || "";
    return `https://player.vimeo.com/video/${videoId}`;
  };

  return (
    <div className="space-y-6">
      {/* Video/Content Player */}
      <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video">
        {isYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(module.contentUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isVimeo ? (
          <iframe
            src={getVimeoEmbedUrl(module.contentUrl)}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : isDirectVideo ? (
          <video
            src={module.contentUrl}
            controls
            className="w-full h-full"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            src={module.contentUrl}
            className="w-full h-full"
            allowFullScreen
          />
        )}
      </div>

      {/* Module Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
      </div>

      {/* Completion Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isCompleted ? (
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Module Completed</span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600">
              Finished watching? Mark this module as complete to track your
              progress.
            </p>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
            <button
              onClick={handleMarkComplete}
              disabled={isCompleting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Mark as Complete
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
