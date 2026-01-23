import { prisma } from "@/lib/prisma";
import { cache } from "react";

export type ModuleDetailUI = {
  id: string;
  title: string;
  contentUrl: string;
  isCompleted: boolean;
};

export type WorkshopDetailUI = {
  id: string;
  title: string;
  instructions: string;
  isRegistered: boolean;
  submission: {
    submissionUrl: string;
    score: number | null;
    feedback: string | null;
  } | null;
};

export type CourseItemDetailUI = {
  id: string;
  slug: string;
  type: "MODULE" | "WORKSHOP";
  position: number;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  module: ModuleDetailUI | null;
  workshop: WorkshopDetailUI | null;
  prevItem: { slug: string } | null;
  nextItem: { slug: string } | null;
  totalItems: number;
};

export const getCourseItemDetail = cache(
  async (
    courseSlug: string,
    itemSlug: string,
    userId?: string
  ): Promise<CourseItemDetailUI | null> => {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        items: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            slug: true,
            position: true,
            type: true,
          },
        },
      },
    });

    if (!course) return null;

    const currentIndex = course.items.findIndex(
      (item) => item.slug === itemSlug
    );
    if (currentIndex === -1) return null;

    const currentItem = course.items[currentIndex];
    const prevItem = currentIndex > 0 ? course.items[currentIndex - 1] : null;
    const nextItem =
      currentIndex < course.items.length - 1
        ? course.items[currentIndex + 1]
        : null;

    const item = await prisma.courseItem.findFirst({
      where: {
        courseId: course.id,
        slug: itemSlug,
      },
      include: {
        module: {
          include: {
            progresses: userId
              ? {
                  where: { userId },
                  select: { completedAt: true },
                }
              : false,
          },
        },
        workshop: {
          include: {
            registrations: userId
              ? {
                  where: { userId },
                  select: { id: true },
                }
              : false,
            submissions: userId
              ? {
                  where: { userId },
                  select: {
                    submissionUrl: true,
                    score: true,
                    feedback: true,
                  },
                }
              : false,
          },
        },
      },
    });

    if (!item) return null;

    let moduleDetail: ModuleDetailUI | null = null;
    let workshopDetail: WorkshopDetailUI | null = null;

    if (item.type === "MODULE" && item.module) {
      moduleDetail = {
        id: item.module.id,
        title: item.module.title,
        contentUrl: item.module.contentUrl,
        isCompleted: userId
          ? (item.module.progresses as any[])?.length > 0 &&
            !!(item.module.progresses as any[])[0]?.completedAt
          : false,
      };
    }

    if (item.type === "WORKSHOP" && item.workshop) {
      const submissions = item.workshop.submissions as any[] | undefined;
      const registrations = item.workshop.registrations as any[] | undefined;

      workshopDetail = {
        id: item.workshop.id,
        title: item.workshop.title,
        instructions: item.workshop.instructions,
        isRegistered: userId ? (registrations?.length ?? 0) > 0 : false,
        submission:
          userId && submissions && submissions.length > 0
            ? {
                submissionUrl: submissions[0].submissionUrl,
                score: submissions[0].score,
                feedback: submissions[0].feedback,
              }
            : null,
      };
    }

    return {
      id: item.id,
      slug: item.slug,
      type: item.type,
      position: currentItem.position,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
      },
      module: moduleDetail,
      workshop: workshopDetail,
      prevItem: prevItem ? { slug: prevItem.slug } : null,
      nextItem: nextItem ? { slug: nextItem.slug } : null,
      totalItems: course.items.length,
    };
  }
);
