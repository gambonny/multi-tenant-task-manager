import * as React from "react";
import { ApiError } from "@/api/client";
import { useCreateTaskMutation } from "@/queries/tasks";
import type { Tenant } from "@/types";

const errorId = "new-task-error";

function getCreateTaskErrorMessage(err: unknown): string | null {
	if (!err) return null;

	if (err instanceof ApiError) {
		if (err.status === 401) return "Unauthorized. Check the tenant token.";
		if (err.status === 429) return "Too many requests. Try again in a moment.";
		return err.message || "Request failed.";
	}

	if (err instanceof Error) return err.message;

	return "Something went wrong.";
}

export function NewTaskForm({ tenant }: { tenant: Tenant }) {
	const [title, setTitle] = React.useState("");
	const createTask = useCreateTaskMutation(tenant);

	const trimmed = title.trim();
	const isDisabled = trimmed.length === 0 || createTask.isPending;

	const errorMessage = getCreateTaskErrorMessage(createTask.error);

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		setTitle(e.target.value);

		if (createTask.error) createTask.reset();
	}

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (isDisabled) return;

		createTask.mutate(
			{ title },
			{
				onSuccess: () => {
					setTitle("");
				},
			},
		);
	}

	return (
		<section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 className="text-sm font-semibold text-slate-900">Add a new task</h2>

			<form onSubmit={onSubmit} className="mt-3">
				<label htmlFor="task-title" className="sr-only">
					Task title
				</label>

				<div className="flex gap-3">
					<input
						id="task-title"
						name="title"
						type="text"
						value={title}
						onChange={onChange}
						placeholder="e.g. Pay invoices"
						disabled={createTask.isPending}
						aria-invalid={errorMessage ? true : undefined}
						aria-describedby={errorMessage ? errorId : undefined}
						className={[
							"flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900",
							"placeholder:text-slate-400",
							"transition-colors",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
							"disabled:opacity-60 disabled:cursor-not-allowed",
						].join(" ")}
					/>

					<button
						type="submit"
						disabled={isDisabled}
						className={[
							"inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
							"bg-slate-900 text-white",
							"transition-all duration-150",
							"hover:bg-slate-700",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
							"enabled:active:scale-95 enabled:active:translate-y-[1px]",
							"disabled:opacity-50 disabled:cursor-not-allowed",
						].join(" ")}
					>
						{createTask.isPending ? "Adding..." : "Add task"}
					</button>
				</div>

				{errorMessage ? (
					<p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
						{errorMessage}
					</p>
				) : null}
			</form>
		</section>
	);
}
