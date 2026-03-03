import * as v from "valibot";

export const TaskStatusSchema = v.picklist(["todo", "done"]);

export const TaskSchema = v.object({
	id: v.union([v.string(), v.number()]),
	title: v.pipe(v.string(), v.trim(), v.minLength(1)),
	status: TaskStatusSchema,

	tenantId: v.string(),
	createdAt: v.string(),
});

export const TasksListSchema = v.strictObject({ data: v.array(TaskSchema) });
