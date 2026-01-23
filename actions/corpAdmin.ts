"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function verifyCorp(formData: FormData) {
  const id = formData.get("id") as string;

  const data = await prisma.corporationVerification.findUnique({
    where: { id },
    include: {
      profile: { include: { user: true } },
    },
  });

  if (!data) return;

  await prisma.$transaction([
    prisma.corporationVerification.update({
      where: { id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: data.profile.userId },
      data: { role: "CORPORATION" },
    }),
  ]);

  revalidatePath(`/admin/corporations/${id}`);
  redirect(`/admin/corporations/${id}`);
}

export async function unverifyCorp(formData: FormData) {
  const id = formData.get("id") as string;

  const data = await prisma.corporationVerification.findUnique({
    where: { id },
    include: {
      profile: { include: { user: true } },
    },
  });

  if (!data) return;

  await prisma.$transaction([
    prisma.corporationVerification.update({
      where: { id },
      data: {
        status: "UNVERIFIED",
        verifiedAt: null,
      },
    }),
    prisma.user.update({
      where: { id: data.profile.userId },
      data: { role: "CORPORATION" },
    }),
  ]);

  revalidatePath(`/admin/corporations/${id}`);
  redirect(`/admin/corporations/${id}`);
}
