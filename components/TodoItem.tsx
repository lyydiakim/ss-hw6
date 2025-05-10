"use client";

import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTodo } from "@/actions/todos";
import { useActionState } from "react";
import { useOptimistic } from "react";
import { useState, useTransition } from "react";

export function TodoItem({ todo }: { todo: Todo }) {
  // Track optimistic state locally
  const [optimisticTodo, setOptimisticTodo] = useOptimistic<Todo>(todo);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Create wrapper for toggleTodo with correct type
  const toggleTodoWithState = (
    state:
      | { error: string; success?: undefined }
      | { success: boolean; error?: undefined }
      | null,
    formData: FormData
  ) => {
    return toggleTodo(formData);
  };

  const [state, formAction] = useActionState(toggleTodoWithState, null);

  // Handle checkbox change with optimistic update
  const handleToggle = () => {
    // Create form data with todo ID
    const formData = new FormData();
    formData.append("id", todo.id);

    // Start transition to prevent UI freeze
    startTransition(() => {
      // Update optimistic state
      setOptimisticTodo((prevState) => ({
        ...prevState,
        completed: !prevState.completed,
      }));
      // Submit the action
      formAction(formData);
    });
  };

  // Show error if toggle failed
  if (state?.error && !isPending) {
    setError(state.error);
  }

  return (
    <li
      key={optimisticTodo.id}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${
        error ? "border-red-500" : ""
      }`}
    >
      <Checkbox
        checked={optimisticTodo.completed}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span
        className={`flex-1 ${
          optimisticTodo.completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {optimisticTodo.title}
      </span>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </li>
  );
}
