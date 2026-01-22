import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProfileContainer from "@/components/ProfileContainer";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      profile: true,
    },
  });

  if (!userData) {
    redirect("/login");
  }

  return (
    <main className="bg-white min-h-screen max-w-7xl mx-auto px-6 py-6 lg:px-8">
      <ProfileContainer user={userData} profile={userData.profile} />
    </main>
  );
}