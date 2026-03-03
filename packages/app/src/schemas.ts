import * as v from "valibot";

export const TaskStatusSchema = v.picklist(["todo", "done"]);
export type TaskStatus = v.InferOutput<typeof TaskStatusSchema>;

export const TaskSchema = v.object({
	id: v.union([v.string(), v.number()]),
	title: v.pipe(v.string(), v.trim(), v.minLength(1)),
	status: TaskStatusSchema,

	tenantId: v.string(),
	createdAt: v.string(),
});

export type Task = v.InferOutput<typeof TaskSchema>;

export const TasksListSchema = v.array(TaskSchema);
export type TasksList = v.InferOutput<typeof TasksListSchema>;
