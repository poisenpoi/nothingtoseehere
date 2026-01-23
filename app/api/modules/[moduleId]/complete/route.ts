import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const user = await requireUser();
    const { moduleId } = await params;

    await prisma.$transaction(async (tx) => {
      const module = await tx.module.findUnique({
        where: { id: moduleId },
        include: {
          courseItem: {
            select: { courseId: true },
          },
        },
      });

      if (!module || !module.courseItem) {
        throw new Error("MODULE_NOT_FOUND");
      }

      const courseId = module.courseItem.courseId;

      const enrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
      });

      if (!enrollment) {
        throw new Error("NOT_ENROLLED");
      }

      await tx.moduleProgress.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId: moduleId,
          },
        },
        update: {
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          moduleId: moduleId,
          completedAt: new Date(),
        },
      });

      const totalItems = await tx.courseItem.count({
        where: { courseId: courseId },
      });

      const completedModules = await tx.moduleProgress.count({
        where: {
          userId: user.id,
          module: {
            courseItem: { courseId: courseId },
          },
        },
      });

      const completedWorkshops = await tx.workshopSubmission.count({
        where: {
          userId: user.id,
          workshop: {
            courseItem: { courseId: courseId },
          },
        },
      });

      const completedItems = completedModules + completedWorkshops;

      await tx.enrollment.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
        data: {
          progressPercent: (completedItems / totalItems) * 100,
          status: completedItems === totalItems ? "COMPLETED" : "IN_PROGRESS",
        },
      });
    });

    return NextResponse.json({ message: "Module completed" }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "MODULE_NOT_FOUND") {
      return NextResponse.json(
        { message: "Module not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message === "NOT_ENROLLED") {
      return NextResponse.json(
        { message: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    console.error("Complete course error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
