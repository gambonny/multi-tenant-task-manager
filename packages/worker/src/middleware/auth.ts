import { createMiddleware } from "hono/factory";
import type { AppEnv } from "@/env";

export type TenantId = "tenant_a" | "tenant_b";
export type UserId = "user_one" | "user_two";

export type AuthContext = {
	tenantId: TenantId;
	userId: UserId;
};

function unauthorized() {
	return new Response(JSON.stringify({ error: "Unauthorized" }), {
		status: 401,
		headers: { "content-type": "application/json" },
	});
}

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	const header = c.req.header("authorization");
	if (!header) return unauthorized();

	const prefix = "Bearer ";
	if (!header.startsWith(prefix)) return unauthorized();

	const token = header.slice(prefix.length).trim();
	if (!token) return unauthorized();

	let auth: AuthContext | null = null;

	if (token === c.env.TENANT_A_TOKEN)
		auth = { tenantId: "tenant_a", userId: "user_one" } satisfies AuthContext;
	else if (token === c.env.TENANT_B_TOKEN)
		auth = { tenantId: "tenant_b", userId: "user_two" } satisfies AuthContext;

	if (!auth) return unauthorized();

	c.set("auth", auth);
	return await next();
});
