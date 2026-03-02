import * as v from "valibot";

export const CreateTaskSchema = v.strictObject({
	title: v.pipe(v.string(), v.trim(), v.minLength(1, "Title is required")),
	status: v.optional(v.picklist(["todo", "done"]), "todo"),
});

export const TaskIdParamsSchema = v.strictObject({
	id: v.pipe(v.string(), v.trim()),
});

export type CreateTask = v.InferOutput<typeof CreateTaskSchema>;

export type TaskIdParams = v.InferOutput<typeof TaskIdParamsSchema>;
