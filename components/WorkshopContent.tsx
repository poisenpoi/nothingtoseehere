"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Loader2,
  Code,
  ClipboardCheck,
  ExternalLink,
  Star,
  MessageSquare,
} from "lucide-react";
import { WorkshopDetailUI } from "@/lib/data/courseItems";

interface WorkshopContentProps {
  workshop: WorkshopDetailUI;
  courseSlug: string;
  nextItemSlug: string | null;
}

export default function WorkshopContent({
  workshop,
  courseSlug,
  nextItemSlug,
}: WorkshopContentProps) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(workshop.isRegistered);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState(workshop.submission);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);

    try {
      const res = await fetch(`/api/workshops/${workshop.id}/registration`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to register");
      }

      setIsRegistered(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workshops/${workshop.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionUrl: submissionUrl.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit");
      }

      setSubmission({
        submissionUrl: submissionUrl.trim(),
        score: null,
        feedback: null,
      });

      // Navigate to next item or refresh
      if (nextItemSlug) {
        router.push(`/courses/${courseSlug}/${nextItemSlug}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workshop Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Code className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              Workshop
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {workshop.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-slate-600" />
          Instructions
        </h2>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 whitespace-pre-wrap">
            {workshop.instructions}
          </p>
        </div>
      </div>

      {/* Registration / Submission Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {!isRegistered ? (
          // Registration Required
          <div className="space-y-4">
            <p className="text-slate-600">
              Register for this workshop to start working on your submission.
            </p>
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Code className="w-5 h-5" />
                  Register for Workshop
                </>
              )}
            </button>
          </div>
        ) : submission ? (
          // Already Submitted
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Workshop Submitted</span>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Your submission:</span>
                <a
                  href={submission.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {submission.submissionUrl}
                </a>
              </div>

              {submission.score !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-600">Score:</span>
                  <span className="font-semibold text-slate-900">
                    {submission.score}/100
                  </span>
                </div>
              )}

              {submission.feedback && (
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-slate-600">Feedback:</span>
                    <p className="text-slate-900 mt-1">{submission.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Registered but not submitted
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">
              Submit Your Workshop
            </h3>
            <p className="text-slate-600 text-sm">
              Share a link to your completed work (GitHub repo, CodeSandbox,
              deployed project, etc.)
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="submissionUrl"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Submission URL
                </label>
                <input
                  type="url"
                  id="submissionUrl"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !submissionUrl.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Workshop
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
