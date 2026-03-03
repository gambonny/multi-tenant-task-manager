import type { Tenant } from "@/types";

export type TenantAuth = Pick<Tenant, "id" | "token">;

type ApiFetchOptions = {
	tenant: TenantAuth;
	method?: "GET" | "POST" | "DELETE";
	body?: unknown;
	headers?: HeadersInit;
};

export class ApiError extends Error {
	status: number;
	data?: unknown;

	constructor(message: string, status: number, data?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
}

export async function apiFetch<T>(
	path: string,
	{ tenant, method = "GET", body, headers }: ApiFetchOptions,
): Promise<T> {
	const API_URL = import.meta.env.VITE_API_URL as string;

	if (!API_URL) {
		throw new Error("Missing env var: VITE_API_URL");
	}

	const response = await fetch(`${API_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${tenant.token}`,
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	let data: unknown = null;

	try {
		data = await response.json();
	} catch {
		// Ignore if no JSON body
	}

	if (!response.ok) {
		const message =
			(typeof data === "object" &&
				data !== null &&
				"error" in data &&
				typeof data.error === "string" &&
				data.error) ||
			response.statusText ||
			"Request failed";

		throw new ApiError(message, response.status, data);
	}

	return data as T;
}
