import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCourseItemDetail } from "@/lib/data/courseItems";
import ModuleContent from "@/components/ModuleContent";
import WorkshopContent from "@/components/WorkshopContent";

export const dynamic = "force-dynamic";

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

  const item = await prisma.courseItem.findFirst({
    where: {
      slug: itemSlug,
      course: { slug },
    },
    include: {
      course: { select: { title: true } },
      module: { select: { title: true } },
      workshop: { select: { title: true } },
    },
  });

  if (!item) {
    return { title: "Item Not Found" };
  }

  const title = item.module?.title || item.workshop?.title || "Course Item";

  return {
    title: `${title} - ${item.course.title} | Learning Platform`,
  };
}

export default async function CourseItemPage({ params }: PageProps) {
  const { slug: courseSlug, itemSlug } = await params;
  const user = await getCurrentUser();

  // User must be logged in to view course items
  if (!user) {
    redirect(`/login?redirect=/courses/${courseSlug}/${itemSlug}`);
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      course: { slug: courseSlug },
    },
  });

  if (!enrollment) {
    // Not enrolled, redirect to course page
    redirect(`/courses/${courseSlug}`);
  }

  // Fetch course item details
  const courseItem = await getCourseItemDetail(courseSlug, itemSlug, user.id);

  if (!courseItem) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/courses/${courseSlug}`}
                className="text-slate-600 hover:text-blue-600 flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                {courseItem.course.title}
              </Link>
            </div>

            {/* Progress indicator */}
            <div className="text-sm text-slate-500">
              Lesson {courseItem.position + 1} of {courseItem.totalItems}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courseItem.type === "MODULE" && courseItem.module && (
          <ModuleContent
            module={courseItem.module}
            courseSlug={courseSlug}
            nextItemSlug={courseItem.nextItem?.slug || null}
          />
        )}

        {courseItem.type === "WORKSHOP" && courseItem.workshop && (
          <WorkshopContent
            workshop={courseItem.workshop}
            courseSlug={courseSlug}
            nextItemSlug={courseItem.nextItem?.slug || null}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200">
          {courseItem.prevItem ? (
            <Link
              href={`/courses/${courseSlug}/${courseItem.prevItem.slug}`}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous Lesson</span>
            </Link>
          ) : (
            <div />
          )}

          {courseItem.nextItem ? (
            <Link
              href={`/courses/${courseSlug}/${courseItem.nextItem.slug}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href={`/courses/${courseSlug}`}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <span>Back to Course</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
