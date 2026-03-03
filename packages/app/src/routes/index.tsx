import { createFileRoute } from "@tanstack/react-router";
import { ButtonLink } from "@/components/ButtonLink";

export const Route = createFileRoute("/")({
	component: RouteComponent,
	head: () => ({
		meta: [{ title: "Home" }],
	}),
});

function RouteComponent() {
	return (
		<main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md rounded-xl bg-white shadow-sm border border-slate-200 p-8">
				<h1 className="text-xl font-semibold text-slate-900 text-center">
					Select a Tenant
				</h1>

				<div className="mt-6 flex flex-col gap-4">
					<ButtonLink
						to="/tenants/$tenantId"
						params={{ tenantId: "A" }}
						className="w-full"
					>
						Tenant A
					</ButtonLink>

					<ButtonLink
						to="/tenants/$tenantId"
						params={{ tenantId: "B" }}
						className="w-full"
					>
						Tenant B
					</ButtonLink>
				</div>
			</div>
		</main>
	);
}
