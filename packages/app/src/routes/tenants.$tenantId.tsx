import {
	createFileRoute,
	type ErrorComponentProps,
	notFound,
} from "@tanstack/react-router";
import React from "react";
import { ApiError } from "@/api/client";
import { ButtonLink } from "@/components/ButtonLink";
import { CenteredCard } from "@/components/CenteredCard";
import { NewTaskForm } from "@/components/NewTaskForm";
import { TaskList } from "@/components/TaskList";
import { TenantPending } from "@/components/TenantPending";
import { tasksListOptions } from "@/queries/tasks";
import type { Tenant } from "@/types";

function resolveTenant(tenantIdRaw: string): Tenant {
	if (tenantIdRaw === "A") {
		const token = import.meta.env.VITE_TENANT_A_TOKEN as string | undefined;
		if (!token) throw new Error("Missing env var: VITE_TENANT_A_TOKEN");

		return {
			id: "A",
			name: "Tenant A",
			userId: "user_one",
			token,
		} satisfies Tenant;
	}

	if (tenantIdRaw === "B") {
		const token = import.meta.env.VITE_TENANT_B_TOKEN as string | undefined;
		if (!token) throw new Error("Missing env var: VITE_TENANT_B_TOKEN");

		return {
			id: "B",
			name: "Tenant B",
			userId: "user_two",
			token,
		} satisfies Tenant;
	}

	throw notFound({
		data: {
			message: `Tenant "${tenantIdRaw}" does not exist.`,
			validTenants: ["A", "B"],
		},
	});
}

function getTenantErrorMessage(error: unknown) {
	if (error instanceof ApiError) {
		if (error.status === 401) return "Unauthorized. Check the tenant token.";
		if (error.status === 429)
			return "Too many requests. Try again in a moment.";
		return error.message || "Request failed.";
	}

	if (error instanceof Error) return error.message;

	return "Something went wrong.";
}

export const Route = createFileRoute("/tenants/$tenantId")({
	head: () => ({
		meta: [{ title: "Tenant tasks list" }],
	}),
	loader: async ({ params, context }) => {
		const tenant = resolveTenant(params.tenantId);
		await context.queryClient.prefetchQuery(tasksListOptions(tenant));
		return { tenant };
	},

	pendingComponent: () => <TenantPending />,
	errorComponent: (props) => <TenantError {...props} />,
	notFoundComponent: () => <TenantNotFound />,
	component: TenantRoute,
});

function TenantRoute() {
	const { tenant } = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-10">
			<main className="mx-auto w-full max-w-3xl">
				<TenantHeader tenant={tenant} />

				<NewTaskForm tenant={tenant} />

				<React.Suspense fallback={<TasksPending />}>
					<TaskList tenant={tenant} />
				</React.Suspense>
			</main>
		</div>
	);
}

function TenantHeader({ tenant }: { tenant: Tenant }) {
	return (
		<header className="flex items-center justify-between">
			<div>
				<h1 className="text-xl font-semibold text-slate-900">{tenant.name}</h1>
				<p className="mt-1 text-sm text-slate-600">
					Acting as <span className="font-medium">{tenant.userId}</span>
				</p>
			</div>

			<ButtonLink to="/">Change tenant</ButtonLink>
		</header>
	);
}

function TasksPending() {
	return (
		<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
			<p className="mt-2 text-sm text-slate-600">Loading…</p>
		</section>
	);
}

function TenantError({ error }: ErrorComponentProps) {
	return (
		<CenteredCard
			title="Something went wrong"
			actions={<ButtonLink to="/">Back to tenant selection</ButtonLink>}
		>
			<p role="alert" className="mt-2 text-sm text-red-600">
				{getTenantErrorMessage(error)}
			</p>
		</CenteredCard>
	);
}

function TenantNotFound() {
	return (
		<CenteredCard
			title="Tenant not found"
			actions={<ButtonLink to="/">Back to tenant selection</ButtonLink>}
		>
			<p className="mt-2 text-sm text-slate-600">
				Valid tenants are <span className="font-medium">A</span> and{" "}
				<span className="font-medium">B</span>.
			</p>
		</CenteredCard>
	);
}
