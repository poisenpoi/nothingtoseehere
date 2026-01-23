"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Send, FileText } from "lucide-react";

interface WorkshopContentProps {
  workshopId: string;
  title: string;
  instructions: string;
  isCompleted: boolean;
  courseSlug: string;
  nextItemSlug?: string;
}

export default function WorkshopContent({
  workshopId,
  title,
  instructions,
  isCompleted,
  courseSlug,
  nextItemSlug,
}: WorkshopContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [registered, setRegistered] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/registration`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to register");
      }

      setRegistered(true);
      setSuccess("Successfully registered for the workshop!");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) {
      setError("Please enter a submission URL");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/workshops/${workshopId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit");
      }

      setCompleted(true);
      setSuccess("Workshop submitted successfully!");
      router.refresh();

      // Navigate to next item if available
      if (nextItemSlug) {
        setTimeout(() => {
          router.push(`/courses/${courseSlug}/${nextItemSlug}`);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Instructions Header */}
      <div className="bg-purple-50 border-b border-purple-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Workshop Instructions</h2>
            <p className="text-sm text-slate-500">
              Complete the tasks below and submit your work
            </p>
          </div>
        </div>
      </div>

      {/* Instructions Content */}
      <div className="p-6 prose prose-slate max-w-none">
        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
          {instructions}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-6 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Submission Section */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        {completed ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle className="w-5 h-5" />
              You have completed this workshop
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="submissionUrl"
                className="block text-sm font-medium text-slate-700"
              >
                Submit your work
              </label>
              {!registered && (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {registering ? "Registering..." : "Register first"}
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="url"
                id="submissionUrl"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/yourusername/your-project"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-slate-500">
              Submit a link to your completed work (GitHub repo, Google Drive,
              etc.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
