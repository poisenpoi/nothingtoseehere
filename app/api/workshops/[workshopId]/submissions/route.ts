import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workshopId: string }> }
) {
  try {
    const { workshopId } = await params;
    const user = await requireUser();

    // Get workshop with course info for progress tracking
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        courseItem: {
          select: { courseId: true },
        },
      },
    });

    if (!workshop || !workshop.courseItem) {
      return NextResponse.json(
        { message: "Workshop not found" },
        { status: 404 }
      );
    }

    const courseId = workshop.courseItem.courseId;

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { submissionUrl } = body;

    // Use upsert to allow resubmission and update progress in a transaction
    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.workshopSubmission.upsert({
        where: {
          userId_workshopId: {
            userId: user.id,
            workshopId,
          },
        },
        update: {
          submissionUrl,
          submittedAt: new Date(),
          score: 100, // Auto-score for now
        },
        create: {
          submissionUrl,
          userId: user.id,
          workshopId,
          score: 100, // Auto-score for now
        },
      });

      // Update course progress
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

    return NextResponse.json(
      { message: "Workshop is submitted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
