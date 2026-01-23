import { notFound, redirect } from "next/navigation";
import { getModuleByItemSlug } from "@/lib/data/modules";
import { getCurrentUser } from "@/lib/auth";
import ModuleView from "@/components/ModuleView";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface PageProps {
  params: Promise<{
    slug: string;
    itemSlug: string;
  }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { slug: courseSlug, itemSlug } = await params;
  const user = await getCurrentUser();

  // Check if user is enrolled in the course
  if (user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: (
            await prisma.course.findUnique({
              where: { slug: courseSlug },
              select: { id: true },
            })
          )?.id!,
        },
      },
    });

    if (!enrollment) {
      redirect(`/courses/${courseSlug}`);
    }
  } else {
    redirect(`/login`);
  }

  const module = await getModuleByItemSlug(
    courseSlug,
    itemSlug,
    user?.id,
  );

  if (!module) {
    notFound();
  }

  const handleComplete = async () => {
    "use server";

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: module.id,
        },
      },
      create: {
        userId: user.id,
        moduleId: module.id,
        completedAt: new Date(),
      },
      update: {
        completedAt: new Date(),
      },
    });

    // Update course progress
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      include: {
        items: {
          include: {
            module: true,
            workshop: true,
          },
        },
      },
    });

    if (course) {
      const totalItems = course.items.length;

      // Count completed modules
      const completedModules = await prisma.moduleProgress.count({
        where: {
          userId: user.id,
          moduleId: {
            in: course.items
              .filter((item) => item.moduleId)
              .map((item) => item.moduleId!),
          },
          completedAt: {
            not: null,
          },
        },
      });

      // Count completed workshops (submitted)
      const completedWorkshops = await prisma.workshopSubmission.count({
        where: {
          userId: user.id,
          workshopId: {
            in: course.items
              .filter((item) => item.workshopId)
              .map((item) => item.workshopId!),
          },
        },
      });

      const completedItems = completedModules + completedWorkshops;
      const progressPercent =
        totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        data: {
          progressPercent: Math.round(progressPercent),
          status: progressPercent >= 100 ? "COMPLETED" : "IN_PROGRESS",
        },
      });
    }

    revalidatePath(`/courses/${courseSlug}/${itemSlug}`);
    revalidatePath(`/courses/${courseSlug}`);
  };

  return <ModuleView module={module} onComplete={handleComplete} />;
}
