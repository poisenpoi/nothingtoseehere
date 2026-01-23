import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function POST(
  _: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const user = await requireUser();

    await prisma.$transaction(async (tx: TransactionClient) => {
      // Get the module with its course item to find the courseId
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
            courseId,
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
            moduleId,
          },
        },
        update: {
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          moduleId,
          completedAt: new Date(),
        },
      });

      const totalItems = await tx.courseItem.count({
        where: { courseId },
      });

      const completedModules = await tx.moduleProgress.count({
        where: {
          userId: user.id,
          module: {
            courseItem: { courseId },
          },
        },
      });

      const completedWorkshops = await tx.workshopSubmission.count({
        where: {
          userId: user.id,
          workshop: {
            courseItem: { courseId },
          },
        },
      });

      const completedItems = completedModules + completedWorkshops;

      await tx.enrollment.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        data: {
          progressPercent: (completedItems / totalItems) * 100,
          status: completedItems === totalItems ? "COMPLETED" : "IN_PROGRESS",
        },
      });
    });

    return NextResponse.json({ message: "Module completed" }, { status: 200 });
  } catch (error: any) {
    if (error.message === "MODULE_NOT_FOUND") {
      return NextResponse.json(
        { message: "Module not found" },
        { status: 404 }
      );
    }

    if (error.message === "NOT_ENROLLED") {
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
