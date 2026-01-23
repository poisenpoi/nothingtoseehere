import { prisma } from "@/lib/prisma";

export interface ModuleWithProgress {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  videoUrl: string | null;
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }> | null;
  isCompleted: boolean;
  courseSlug: string;
  courseTitle: string;
  nextItem: {
    slug: string;
    title: string;
    type: "MODULE" | "WORKSHOP";
  } | null;
  previousItem: {
    slug: string;
    title: string;
    type: "MODULE" | "WORKSHOP";
  } | null;
}

export async function getModuleByItemSlug(
  courseSlug: string,
  itemSlug: string,
  userId?: string,
): Promise<ModuleWithProgress | null> {
  const courseItem = await prisma.courseItem.findFirst({
    where: {
      slug: itemSlug,
      course: {
        slug: courseSlug,
      },
      type: "MODULE",
    },
    include: {
      module: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          items: {
            select: {
              slug: true,
              position: true,
              type: true,
              module: {
                select: {
                  title: true,
                },
              },
              workshop: {
                select: {
                  title: true,
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });

  if (!courseItem || !courseItem.module) {
    return null;
  }

  const { module, course, position } = courseItem;

  // Check if module is completed
  let isCompleted = false;
  if (userId) {
    const progress = await prisma.moduleProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId: module.id,
        },
      },
    });
    isCompleted = !!progress?.completedAt;
  }

  // Find next and previous items
  const currentIndex = course.items.findIndex((item) => item.slug === itemSlug);
  const nextItem =
    currentIndex < course.items.length - 1
      ? course.items[currentIndex + 1]
      : null;
  const previousItem = currentIndex > 0 ? course.items[currentIndex - 1] : null;

  return {
    id: module.id,
    title: module.title,
    description: module.description,
    content: module.content,
    duration: module.duration,
    videoUrl: module.videoUrl,
    resources: module.resources as Array<{
      title: string;
      url: string;
      type: string;
    }> | null,
    isCompleted,
    courseSlug: course.slug,
    courseTitle: course.title,
    nextItem: nextItem
      ? {
          slug: nextItem.slug,
          title: (nextItem.module?.title || nextItem.workshop?.title) ?? "",
          type: nextItem.type,
        }
      : null,
    previousItem: previousItem
      ? {
          slug: previousItem.slug,
          title:
            (previousItem.module?.title || previousItem.workshop?.title) ?? "",
          type: previousItem.type,
        }
      : null,
  };
}
