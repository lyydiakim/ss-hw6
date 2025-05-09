"use server";

import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { todos } from "@/database/schema";

export async function createTodo(formData: FormData) {
  // 1. Authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  // 2. Extract and validate title
  const title = formData.get("title") as string;

  if (!title || title.trim() === "") {
    return { error: "Title is required" };
  }

  // 3. Slow down to demonstrate optimistic UI
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 4. Insert todo into database
  await db.insert(todos).values({
    title: title.trim(),
    userId: session.user.id,
  });

  // 5. Revalidate the path to update the UI
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

  // 2. Extract todo ID
  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Todo ID is required" };
  }

  // 3. Perform security check and update in a single query
  // This is the key defensive programming - we only update if userId matches
  const result = await db
    .update(todos)
    .set({
      completed: sql`NOT ${todos.completed}`, // Toggle the current value
    })
    .where(
      and(
        eq(todos.id, id),
        eq(todos.userId, session.user.id) // Security check: only owner can toggle
      )
    )
    .returning();

  // 4. Check if the update was successful
  const wasUpdated = result.length > 0;

  if (!wasUpdated) {
    return { error: "Not authorized to update this todo" };
  }

  // 5. Revalidate to refresh the todos page
  revalidatePath("/todos");

  return { success: true };
}

export async function deleteTodo(formData: FormData) {
  //auth check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "not authenticated." };
  }

  // only admins can delete
  if (session.user.role !== "admin") {
    return { error: "need admin access " };
  }

  // extract todo ID
  const id = formData.get("id") as string;
  if (!id) {
    return { error: "todo id required" };
  }

  // delete the todo
  await db.delete(todos).where(eq(todos.id, id));

  revalidatePath("/admin");
}
