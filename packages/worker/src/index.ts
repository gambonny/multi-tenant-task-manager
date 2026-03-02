import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { dbMiddleware } from "@/middleware/db";
import { authMiddleware } from "@/middleware/auth";

const app = new Hono<AppEnv>();

app.use("*", authMiddleware);
app.use("*", dbMiddleware);

app.get("/health", (c) => {
	const db = c.get("db");
	const auth = c.get("auth");

	return c.json({ ok: true, tenantId: auth.tenantId, userId: auth.userId });
});

export default app;
