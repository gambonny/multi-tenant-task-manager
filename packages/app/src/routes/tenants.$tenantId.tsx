import { createFileRoute, notFound } from "@tanstack/react-router";
import { ButtonLink } from "@/components/ButtonLink";
import type { Tenant } from "@/types";

function resolveTenant(tenantIdRaw: string): Tenant {
	if (tenantIdRaw === "A") {
		const token = import.meta.env.VITE_TENANT_A_TOKEN as string | undefined;
		if (!token) {
			throw new Error("Missing env var: VITE_TENANT_A_TOKEN");
		}

		return {
			id: "A",
			name: "Tenant A",
			userId: "user_one",
			token,
		} satisfies Tenant;
	}

	if (tenantIdRaw === "B") {
		const token = import.meta.env.VITE_TENANT_B_TOKEN as string | undefined;
		if (!token) {
			throw new Error("Missing env var: VITE_TENANT_B_TOKEN");
		}

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
	loader: ({ params }) => {
		const tenant = resolveTenant(params.tenantId);
		return { tenant };
	},
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

				<div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<p className="text-sm text-slate-700">
						Next: tasks list + inline create form + delete actions.
					</p>
				</div>
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
