import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";

export function TodoItem({ todo }: { todo: Todo }) {

    return (
        <li
            key={todo.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2`}
        >
            <Checkbox
                defaultChecked={todo.completed}
            />
            <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.title}
            </span>
        </li>
    )
}