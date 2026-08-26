"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { email: session.user.email },
    data: { name: data.name },
  });

  revalidatePath("/telegram/profile");
  return { success: true };
}
