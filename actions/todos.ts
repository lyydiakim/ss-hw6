"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { todos } from "@/database/schema";

export async function createTodo(_: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  // ✅ Auth check
  if (!session?.user) {
    return { error: "You must be signed in to add a todo." };
  }

  const title = formData.get("title");

  // ✅ Validate input
  if (typeof title !== "string" || title.trim() === "") {
    return { error: "Title cannot be empty." };
  }

  // ✅ Simulate delay (optional for optimistic testing)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // ✅ Insert todo
  await db.insert(todos).values({
    title,
    userId: session.user.id,
  });

  // ✅ Trigger revalidation of the page
  revalidatePath("/todos");

  return { success: true };
}

export async function toggleTodo(/* */) {
  /* YOUR CODE HERE */
}

export async function deleteTodo(formData: FormData) {
  /* YOUR AUTHORIZATION CHECK HERE */
  const id = formData.get("id") as string;
  await db.delete(todos).where(eq(todos.id, id));

  revalidatePath("/admin");
}
