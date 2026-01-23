"use client";

import Link from "next/link";
import {
  ChevronRight,
  Clock,
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Link2,
  PlayCircle,
  Download,
} from "lucide-react";
import { ModuleWithProgress } from "@/lib/data/modules";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ModuleViewProps {
  module: ModuleWithProgress;
  onComplete: () => Promise<void>;
}

export default function ModuleView({ module, onComplete }: ModuleViewProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "documentation":
        return <FileText className="w-4 h-4" />;
      case "video":
        return <PlayCircle className="w-4 h-4" />;
      case "download":
        return <Download className="w-4 h-4" />;
      default:
        return <Link2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link
              href="/courses"
              className="text-eduBlue hover:underline font-medium"
            >
              Courses
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link
              href={`/courses/${module.courseSlug}`}
              className="text-eduBlue hover:underline font-medium"
            >
              {module.courseTitle}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">{module.title}</span>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {module.isCompleted ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Circle className="w-3 h-3" /> In Progress
                  </span>
                )}
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(module.duration)}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-white mb-3">
                {module.title}
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                {module.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Video Section */}
              {module.videoUrl && (
                <div className="aspect-video bg-slate-900 relative">
                  <iframe
                    src={module.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={module.title}
                  />
                </div>
              )}

              {/* Module Content */}
              <div className="p-8">
                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-code:text-eduBlue prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark as any}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {module.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {module.previousItem ? (
                <Link
                  href={`/courses/${module.courseSlug}/${module.previousItem.slug}`}
                  className="flex items-center gap-2 text-eduBlue hover:text-blue-700 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs text-slate-500 uppercase">
                      Previous
                    </div>
                    <div>{module.previousItem.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {module.nextItem && (
                <Link
                  href={`/courses/${module.courseSlug}/${module.nextItem.slug}`}
                  className="flex items-center gap-2 text-eduBlue hover:text-blue-700 font-medium text-right"
                >
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Next</div>
                    <div>{module.nextItem.title}</div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Progress Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Your Progress
                </h3>
                {!module.isCompleted ? (
                  <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isCompleting ? "Marking Complete..." : "Mark as Complete"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>Module Completed!</span>
                  </div>
                )}
              </div>

              {/* Resources Card */}
              {module.resources && module.resources.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Resources
                    </div>
                  </h3>
                  <div className="space-y-3">
                    {module.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 group-hover:text-eduBlue transition-colors">
                            {resource.title}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            {resource.type}
                          </div>
                        </div>
                        <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Course */}
              <Link
                href={`/courses/${module.courseSlug}`}
                className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-lg transition-colors"
              >
                Back to Course
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
