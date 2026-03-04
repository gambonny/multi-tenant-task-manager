import {
	createFileRoute,
	notFound,
	type ErrorComponentProps,
} from "@tanstack/react-router";
import { ButtonLink } from "@/components/ButtonLink";
import { NewTaskForm } from "@/components/NewTaskForm";
import { TaskList } from "@/components/TaskList";
import { ApiError } from "@/api/client";
import { tasksListOptions } from "@/queries/tasks";
import type { Tenant } from "@/types";
import React from "react";

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
				<header className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-slate-900">
							{tenant.name}
						</h1>
						<p className="mt-1 text-sm text-slate-600">
							Acting as <span className="font-medium">{tenant.userId}</span>
						</p>
					</div>

					<ButtonLink to="/">Change tenant</ButtonLink>
				</header>

				<NewTaskForm tenant={tenant} />

				<React.Suspense fallback={<TasksPending />}>
					<TaskList tenant={tenant} />
				</React.Suspense>
			</main>
		</div>
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
	const message =
		error instanceof ApiError
			? error.status === 401
				? "Unauthorized. Check the tenant token."
				: error.status === 429
					? "Too many requests. Try again in a moment."
					: error.message || "Request failed."
			: error instanceof Error
				? error.message
				: "Something went wrong.";

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md rounded-xl bg-white shadow-sm border border-slate-200 p-8 text-center">
				<h1 className="text-xl font-semibold text-slate-900">
					Something went wrong
				</h1>
				<p role="alert" className="mt-2 text-sm text-red-600">
					{message}
				</p>

				<div className="mt-6">
					<ButtonLink to="/">Back to tenant selection</ButtonLink>
				</div>
			</div>
		</div>
	);
}

function TenantPending() {
	return (
		<div className="min-h-screen bg-slate-50 px-4 py-10">
			<main className="mx-auto w-full max-w-3xl">
				<header className="flex items-center justify-between">
					<div className="w-full max-w-sm">
						<div className="h-7 w-44 rounded-md bg-slate-200 animate-pulse" />
						<div className="mt-2 h-4 w-72 rounded-md bg-slate-200 animate-pulse" />
					</div>

					<div className="h-10 w-36 rounded-md bg-slate-200 animate-pulse" />
				</header>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="h-10 flex-1 rounded-md bg-slate-200 animate-pulse" />
						<div className="h-10 w-28 rounded-md bg-slate-200 animate-pulse" />
					</div>
					<div className="mt-3 h-4 w-56 rounded-md bg-slate-200 animate-pulse" />
				</section>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
						<div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
					</div>

					<ul className="mt-4 space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<li
								key={i}
								className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
							>
								<div className="flex items-center gap-3">
									<div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
									<div className="h-4 w-64 rounded bg-slate-200 animate-pulse" />
								</div>
								<div className="h-4 w-14 rounded bg-slate-200 animate-pulse" />
							</li>
						))}
					</ul>

					<div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
						<span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
						Loading tasks…
					</div>
				</section>
			</main>
		</div>
	);
}

function TenantNotFound() {
	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md rounded-xl bg-white shadow-sm border border-slate-200 p-8 text-center">
				<h1 className="text-xl font-semibold text-slate-900">
					Tenant not found
				</h1>
				<p className="mt-2 text-sm text-slate-600">
					Valid tenants are <span className="font-medium">A</span> and{" "}
					<span className="font-medium">B</span>.
				</p>

				<div className="mt-6">
					<ButtonLink to="/">Back to tenant selection</ButtonLink>
				</div>
			</div>
		</div>
	);
}
