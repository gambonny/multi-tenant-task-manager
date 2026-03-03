import type { TaskSchema, TasksListSchema, TaskStatusSchema } from "@/schemas";
import type * as v from "valibot";

export type Tenant =
	| {
			id: "A";
			name: "Tenant A";
			userId: "user_one";
			token: string;
	  }
	| {
			id: "B";
			name: "Tenant B";
			userId: "user_two";
			token: string;
	  };

export type Task = v.InferOutput<typeof TaskSchema>;
export type TasksList = v.InferOutput<typeof TasksListSchema>;
export type TaskStatus = v.InferOutput<typeof TaskStatusSchema>;
