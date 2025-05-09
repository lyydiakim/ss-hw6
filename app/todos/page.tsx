//  TODO'S PAGE

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { todos as todosTable, type Todo } from "@/database/schema";
import { TodoList } from "@/components/TodoList";

export default async function TodosPage() {
  //check session via Better Auth on the server
  const session = await auth.api.getSession({
    headers: await headers(), // pass through incoming cookies/headers
  });

  // If no session, render nothing
  if (!session?.user) {
    return <div>Please sign in to access todo</div>;
  }

  const todos: Todo[] = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.userId, session.user.id));

  // Render the real list
  return (
    <main className="py-8 px-4">
      <section className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Todos</h1>
        <TodoList todos={todos} />
      </section>
    </main>
  );
}
