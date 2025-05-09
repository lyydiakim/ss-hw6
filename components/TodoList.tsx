"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Todo } from "@/database/schema";

import { TodoItem } from "./TodoItem";

export function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div className="space-y-4">
      <form className="flex gap-2 items-stretch">
        <Input name="title" placeholder={"Add a new todo..."} />
        <Button type="submit">Add</Button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
