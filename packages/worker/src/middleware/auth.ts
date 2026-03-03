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
	if (!c.var.getLogger) {
		throw new Error("authMiddleware mis-ordered: logger middleware missing");
	}

	const log = c.var.getLogger({ route: "auth.middleware" });

	const header = c.req.header("authorization");
	if (!header) {
		log.warn("auth:missing-authorization-header", {
			event: "auth:missing:header",
			scope: "auth:header:retrieval",
		});
		return unauthorized();
	}

	const prefix = "Bearer ";
	if (!header.startsWith(prefix)) {
		log.warn("auth:invalid-scheme", {
			event: "auth:invalid:scheme",
			scope: "auth:middleware:bearer",
		});
		return unauthorized();
	}

	const token = header.slice(prefix.length).trim();
	if (!token) {
		log.warn("auth:empty-token", {
			event: "auth:empty:token",
			scope: "auth:middleware:token",
		});
		return unauthorized();
	}

	let auth: AuthContext | null = null;

	if (token === c.env.TENANT_A_TOKEN) {
		auth = { tenantId: "tenant_a", userId: "user_one" } satisfies AuthContext;
	} else if (token === c.env.TENANT_B_TOKEN) {
		auth = { tenantId: "tenant_b", userId: "user_two" } satisfies AuthContext;
	}

	if (!auth) {
		log.warn("auth:invalid-token", {
			event: "auth:invalid:token",
			scope: "auth:middleware:token:validation",
		});
		return unauthorized();
	}

	c.set("auth", auth);

	return await next();
});
