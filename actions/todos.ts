"use server";

import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { todos } from "@/database/schema";

export async function createTodo(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const title = formData.get("title") as string;

  if (!title || title.trim() === "") {
    return { error: "Title is required" };
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await db.insert(todos).values({
    title: title.trim(),
    userId: session.user.id,
  });
  revalidatePath("/todos");
  return { success: true };
}

export async function toggleTodo(formData: FormData) {
  // 1. Authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Todo ID is required" };
  }

  const result = await db
    .update(todos)
    .set({
      completed: sql`NOT ${todos.completed}`, // current value
    })
    .where(
      and(
        eq(todos.id, id),
        eq(todos.userId, session.user.id) //only owner can toggle
      )
    )
    .returning();

  const wasUpdated = result.length > 0;

  if (!wasUpdated) {
    return { error: "Not authorized to update this todo" };
  }

  revalidatePath("/todos");
  return { success: true };
}
export async function deleteTodo(formData: FormData): Promise<void> {
  // Auth check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    console.error("Not authenticated.");
    return;
  }

  // Only admins can delete
  if (session.user.role !== "admin") {
    console.error("Need admin access.");
    return;
  }

  const id = formData.get("id") as string;
  if (!id) {
    console.error("Todo ID required.");
    return;
  }

  try {
    await db.delete(todos).where(eq(todos.id, id));

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
}
