import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ workshopId: string }> }
) {
  try {
    const { workshopId } = await params;
    const user = await requireUser();

    // Get workshop with its course item to find the courseId
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        courseItem: {
          include: {
            course: { select: { isPublished: true } },
          },
        },
      },
    });

    if (!workshop || !workshop.courseItem || !workshop.courseItem.course.isPublished) {
      return NextResponse.json(
        { message: "Workshop not found" },
        { status: 404 }
      );
    }

    const courseId = workshop.courseItem.courseId;

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

    await prisma.workshopRegistration.create({
      data: {
        userId: user.id,
        workshopId: workshop.id,
      },
    });

    return NextResponse.json(
      { message: "Workshop registered" },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Check for Prisma unique constraint violation (P2002)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Already registered" },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
