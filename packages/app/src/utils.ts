import { ApiError } from "@/api/client";
import type { Tenant } from "@/types";
import { notFound } from "@tanstack/react-router";

export function resolveTenant(tenantIdRaw: string): Tenant {
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

export function formatToLocalString(date: string) {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return date;
	return d.toLocaleString();
}

export function getTenantErrorMessage(error: unknown) {
	if (error instanceof ApiError) {
		if (error.status === 401) return "Unauthorized. Check the tenant token.";
		if (error.status === 429)
			return "Too many requests. Try again in a moment.";
		return error.message || "Request failed.";
	}

	if (error instanceof Error) return error.message;

	return "Something went wrong.";
}
