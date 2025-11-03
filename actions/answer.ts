"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

// create tag
export async function AddAnswer(id: string, answer: string) {
  const user = await currentUser();
  if (!user) return;
  if (!id) return;
  try {
    // Ensure the Clerk user exists in our database to satisfy FKs
    const existing = await db.user.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await db.user.create({
        data: {
          userId: user.id,
          name: `${user.firstName ?? ""}${user.lastName ? ` ${user.lastName}` : ""}` || (user.username ?? user.id),
          userName: user.username ?? user.id,
          imageUrl: user.imageUrl ?? "",
          email: user.emailAddresses?.[0]?.emailAddress ?? "",
          bio: "",
          portfolioWebsite: "",
        },
      });
    }

    await db.answer.create({
      data: {
        questionId: id,
        answer: answer,
        userId: user.id,
      },
    });
    // award points for answering a question
    await db.user.update({
      where: { userId: user.id },
      data: { points: { increment: 10 } },
    });
    // refresh profile page cache
    revalidatePath(`/profile/${user.id}`);
    revalidatePath(`/question/${id}`);
    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function DeleteAnswer(id: string) {
  const user = await currentUser();
  if (!user) return;
  if (!id) return;
  try {
    await db.answer.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/", "layout");
  } catch (error) {
    console.log(error);
  }
}
