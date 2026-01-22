"use client";

import { useState } from "react";
import { EnrolledCourseCard } from "@/components/EnrolledCourseCard";

interface EnrollmentWithCourse {
  id: string;
  progressPercent: number;
  course: {
    title: string;
    slug: string;
    level: string;
    duration: number | null;
    category: {
      name: string;
    };
  };
  isFavorite?: boolean;
}

interface EnrolledCourseListProps {
  courses: EnrollmentWithCourse[];
}

export function EnrolledCourseList({ courses }: EnrolledCourseListProps) {
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const filtered =
    filter === "favorites" ? courses.filter((c) => c.isFavorite) : courses;

  return (
    <section className="bg-slate-50 rounded-3xl border border-slate-200/60 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          My Courses
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-eduBlue text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === "favorites"
                ? "bg-eduBlue text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <EnrolledCourseCard key={item.id} enrollment={item} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs italic">
            <p>{filter === "favorites" ? "No favorite courses." : "No active courses."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
