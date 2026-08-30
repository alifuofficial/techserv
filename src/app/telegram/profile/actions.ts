"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized. Please refresh or reopen the app." };
    }

    const trimmedName = data.name ? data.name.trim() : "";
    if (!trimmedName) {
      return { success: false, error: "Full name cannot be blank." };
    }

    const userId = (session.user as any)?.id;
    const email = session.user.email;

    let user = null;
    if (userId) {
      user = await db.user.findUnique({ where: { id: userId } });
    }
    if (!user && email) {
      user = await db.user.findUnique({ where: { email } });
    }

    if (!user) {
      return { success: false, error: "User record not found." };
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { name: trimmedName },
    });

    try {
      revalidatePath("/telegram/profile");
      revalidatePath("/telegram");
    } catch (_) {}

    return { success: true, name: updated.name };
  } catch (err: any) {
    console.error("[updateProfile action error]", err);
    return { success: false, error: err.message || "Failed to update profile" };
  }
}
