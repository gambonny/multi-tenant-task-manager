import {
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { extract } from "@gambonny/valext";
import { apiFetch } from "@/api/client";
import type { TenantAuth } from "@/api/client";
import { TaskSchema, TasksListSchema } from "@/schemas";

export const tasksKeys = {
	all: ["tasks"] as const,
	list: (tenantId: TenantAuth["id"]) => ["tasks", tenantId] as const,
};

export function tasksListOptions(tenant: TenantAuth) {
	return queryOptions({
		queryKey: tasksKeys.list(tenant.id),
		queryFn: async () => {
			const data = await apiFetch<unknown>("/tasks", { tenant });
			const { output, success, issues } = extract(TasksListSchema).from(data);

			if (!success) {
				console.error(issues);
				throw new Error("Failed during parsing");
			}

			return output.data;
		},
	});
}

export function useTasksSuspenseQuery(tenant: TenantAuth) {
	return useSuspenseQuery(tasksListOptions(tenant));
}

export function useCreateTaskMutation(tenant: TenantAuth) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (input: { title: string }) => {
			const title = input.title.trim();
			if (!title) throw new Error("Title is required");

			const data = await apiFetch<unknown>("/tasks", {
				tenant,
				method: "POST",
				body: { title, status: "todo" },
			});

			return extract(TaskSchema).from(data);
		},
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: tasksKeys.list(tenant.id) });
		},
	});
}

export function useDeleteTaskMutation(tenant: TenantAuth) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (taskId: string | number) => {
			if (taskId === "" || taskId === null || taskId === undefined) {
				throw new Error("Task id is required");
			}

			await apiFetch<unknown>(`/tasks/${encodeURIComponent(String(taskId))}`, {
				tenant,
				method: "DELETE",
			});

			return { ok: true } as const;
		},
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: tasksKeys.list(tenant.id) });
		},
	});
}
