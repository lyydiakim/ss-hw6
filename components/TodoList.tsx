"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Todo } from "@/database/schema";
import { TodoItem } from "./TodoItem";

import { createTodo } from "@/actions/todos";
import { useRef } from "react";
import { useActionState } from "react";
import { useOptimistic } from "react";
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

  // Updated action state type
  const createTodoWithState = (
    state:
      | { error: string; success?: undefined }
      | { success: boolean; error?: undefined }
      | null,
    formData: FormData
  ) => createTodo(formData);

  const [state, formAction] = useActionState(createTodoWithState, null);

  // Use only the initial todos array as the state argument for useOptimistic
  const [optimisticTodos, addOptimisticTodo] = useOptimistic<Todo[]>(todos);

  const clientAction = (formData: FormData) => {
    const title = formData.get("title") as string;

    if (title && title.trim() !== "") {
      // Now we update optimisticTodos correctly
      addOptimisticTodo((prevTodos) => [
        ...prevTodos,
        {
          id: `temp-${Date.now()}`,
          title,
          completed: false,
          userId: "pending",
          createdAt: new Date(),
        } as Todo, // Ensure it's typed as Todo
      ]);
      formRef.current?.reset(); // Resetting the form
    }

    formAction(formData); // Trigger the form action with formData
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
