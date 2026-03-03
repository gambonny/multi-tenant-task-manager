import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { extract } from "@gambonny/valext";
import { apiFetch } from "@/api/client";
import type { TenantAuth } from "@/api/client";

import { TaskSchema, TasksListSchema } from "@/schemas";

export const tasksKeys = {
	all: ["tasks"] as const,
	list: (tenantId: TenantAuth["id"]) => ["tasks", tenantId] as const,
};

export function useTasksQuery(tenant: TenantAuth) {
	return useQuery({
		queryKey: tasksKeys.list(tenant.id),
		queryFn: async () => {
			const data = await apiFetch<unknown>("/tasks", { tenant });
			return extract(TasksListSchema).from(data);
		},
	});
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
