"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Todo } from "@/database/schema";
import { TodoItem } from "./TodoItem";

import { createTodo } from "@/actions/todos";
import { useRef } from "react";
import { useActionState } from "react"; //!
import { useOptimistic } from "react"; //!
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding todo" : "Add"}
    </Button>
  );
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  const createTodoWithState = (prevState: any, formData: FormData) =>
    createTodo(formData);

  const [state, formAction] = useActionState(createTodoWithState, null);

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state: Todo[], newTodo: Todo) => [...state, newTodo]
  );

  const clientAction = (formData: FormData) => {
    const title = formData.get("title") as string;

    if (title && title.trim() !== "") {
      addOptimisticTodo({
        id: `temp-${Date.now()}`,
        title,
        completed: false,
        userId: "pending",
        createdAt: new Date(),
      } as Todo);
      formRef.current?.reset(); //resetting the form
    }

    formAction(formData);
  };

  return (
    <div className="space-y-4">
      <form
        ref={formRef}
        action={clientAction}
        className="flex gap-2 items-stretch"
      >
        <div className="flex-1">
          <Input
            name="title"
            placeholder="Add a new todo..."
            className={state?.error ? "border-red-500" : ""}
          />
          {state?.error && (
            <p className="text-sm text-red-500 mt-1">{state.error}</p>
          )}
        </div>
        <SubmitButton />
      </form>

      <ul className="space-y-2">
        {optimisticTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
