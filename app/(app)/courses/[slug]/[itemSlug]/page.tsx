import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  ChevronRight,
  ChevronLeft,
  PlayCircle,
  Code,
  CheckCircle,
} from "lucide-react";
import ModuleContent from "@/components/ModuleContent";
import WorkshopContent from "@/components/WorkshopContent";

export const dynamic = "force-dynamic";

// Type for course item with includes
type CourseItemWithIncludes = {
  id: string;
  slug: string;
  position: number;
  type: "MODULE" | "WORKSHOP";
  courseId: string;
  moduleId: string | null;
  workshopId: string | null;
  createdAt: Date;
  updatedAt: Date;
  module: {
    id: string;
    title: string;
    contentUrl: string;
    progresses: { completedAt: Date | null }[];
  } | null;
  workshop: {
    id: string;
    title: string;
    instructions: string;
    submissions: { score: number | null }[];
  } | null;
};

interface PageProps {
  params: Promise<{
    slug: string;
    itemSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, itemSlug } = await params;

  const courseItem = await prisma.courseItem.findFirst({
    where: {
      slug: itemSlug,
      course: { slug },
    },
    include: {
      module: { select: { title: true } },
      workshop: { select: { title: true } },
      course: { select: { title: true } },
    },
  });

  if (!courseItem) {
    return { title: "Content Not Found" };
  }

  const itemTitle =
    courseItem.module?.title ?? courseItem.workshop?.title ?? "Lesson";

  return {
    title: `${itemTitle} | ${courseItem.course.title}`,
  };
}

export default async function ModulePage({ params }: PageProps) {
  const { slug, itemSlug } = await params;
  console.log("=== MODULE PAGE DEBUG ===");
  console.log("Course slug:", slug);
  console.log("Item slug:", itemSlug);

  const user = await getCurrentUser();
  console.log("User:", user?.email ?? "NOT LOGGED IN");

  // Redirect unauthenticated users
  if (!user) {
    console.log("Redirecting: not authenticated");
    redirect(`/login?redirect=/courses/${slug}/${itemSlug}`);
  }

  // Get course with all items and check enrollment
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          module: {
            include: {
              progresses: {
                where: { userId: user.id },
                select: { completedAt: true },
              },
            },
          },
          workshop: {
            include: {
              submissions: {
                where: { userId: user.id },
                select: { score: true },
              },
            },
          },
        },
      },
      enrollments: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  });

  console.log("Course found:", !!course);
  if (!course) {
    console.log("Redirecting: course not found");
    notFound();
  }

  // Check if user is enrolled
  const isEnrolled = course.enrollments.length > 0;
  console.log("Is enrolled:", isEnrolled);
  if (!isEnrolled) {
    console.log("Redirecting: not enrolled");
    redirect(`/courses/${slug}`);
  }

  // Find the current item
  const items = course.items as CourseItemWithIncludes[];
  console.log("Items count:", items.length);
  console.log("Item slugs:", items.map(i => i.slug));
  const currentItemIndex = items.findIndex(
    (item: CourseItemWithIncludes) => item.slug === itemSlug
  );
  console.log("Current item index:", currentItemIndex);
  if (currentItemIndex === -1) {
    console.log("Redirecting: item not found");
    notFound();
  }

  const currentItem = items[currentItemIndex];
  const prevItem = currentItemIndex > 0 ? items[currentItemIndex - 1] : null;
  const nextItem =
    currentItemIndex < items.length - 1
      ? items[currentItemIndex + 1]
      : null;

  // Determine completion status
  const isCompleted =
    currentItem.type === "MODULE"
      ? !!currentItem.module?.progresses?.[0]?.completedAt
      : !!currentItem.workshop?.submissions?.[0]?.score;

  const itemTitle =
    currentItem.module?.title ?? currentItem.workshop?.title ?? "Untitled";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/courses" className="text-slate-400 hover:text-white">
              Courses
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <Link
              href={`/courses/${slug}`}
              className="text-slate-400 hover:text-white"
            >
              {course.title}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-white font-medium">{itemTitle}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {itemTitle}
                </h1>
                {currentItem.type === "WORKSHOP" && (
                  <span className="rounded bg-purple-100 px-2 py-1 text-xs font-bold text-purple-600">
                    WORKSHOP
                  </span>
                )}
                {isCompleted && (
                  <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    COMPLETED
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500">
                Lesson {currentItem.position} of {items.length}
              </span>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {currentItem.type === "MODULE" && currentItem.module && (
                <ModuleContent
                  moduleId={currentItem.module.id}
                  contentUrl={currentItem.module.contentUrl}
                  isCompleted={isCompleted}
                  courseSlug={slug}
                  nextItemSlug={nextItem?.slug}
                />
              )}
              {currentItem.type === "WORKSHOP" && currentItem.workshop && (
                <WorkshopContent
                  workshopId={currentItem.workshop.id}
                  title={currentItem.workshop.title}
                  instructions={currentItem.workshop.instructions}
                  isCompleted={isCompleted}
                  courseSlug={slug}
                  nextItemSlug={nextItem?.slug}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {prevItem ? (
                <Link
                  href={`/courses/${slug}/${prevItem.slug}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous: {prevItem.module?.title ?? prevItem.workshop?.title}
                </Link>
              ) : (
                <div />
              )}
              {nextItem ? (
                <Link
                  href={`/courses/${slug}/${nextItem.slug}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next: {nextItem.module?.title ?? nextItem.workshop?.title}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${slug}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Back to Course
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Course Curriculum */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="font-bold text-slate-900">Course Curriculum</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {items.length} lessons
                </p>
              </div>
              <div className="divide-y divide-slate-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                {items.map((item: CourseItemWithIncludes, index: number) => {
                  const itemCompleted =
                    item.type === "MODULE"
                      ? !!item.module?.progresses?.[0]?.completedAt
                      : !!item.workshop?.submissions?.[0]?.score;
                  const isCurrent = item.slug === itemSlug;
                  const Icon = item.type === "MODULE" ? PlayCircle : Code;

                  return (
                    <Link
                      key={item.id}
                      href={`/courses/${slug}/${item.slug}`}
                      className={`
                        flex items-center gap-3 p-3 transition-colors
                        ${isCurrent ? "bg-blue-50 border-l-2 border-blue-600" : "hover:bg-slate-50"}
                      `}
                    >
                      <div
                        className={`
                          flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs
                          ${
                            itemCompleted
                              ? "bg-emerald-100 text-emerald-600"
                              : isCurrent
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500"
                          }
                        `}
                      >
                        {itemCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`
                            text-sm truncate
                            ${
                              itemCompleted
                                ? "text-emerald-700"
                                : isCurrent
                                  ? "text-blue-700 font-medium"
                                  : "text-slate-700"
                            }
                          `}
                        >
                          {item.module?.title ?? item.workshop?.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          Lesson {index + 1}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
