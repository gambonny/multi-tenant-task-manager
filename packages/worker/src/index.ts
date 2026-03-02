import * as v from "valibot";
import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { dbMiddleware } from "@/middleware/db";
import { authMiddleware } from "@/middleware/auth";
import { rateLimit } from "@/middleware/rate-limiting";
import { validator } from "hono/validator";
import { CreateTaskSchema, type CreateTask } from "@/schemas";
import { tasks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const app = new Hono<AppEnv>();

app.use("*", authMiddleware);
app.use("*", dbMiddleware);

app.get("/health", (c) => {
	const db = c.get("db");
	const auth = c.get("auth");

	return c.json({ ok: true, tenantId: auth.tenantId, userId: auth.userId });
});

app.post(
	"/tasks",
	rateLimit({ limit: 10, windowMs: 60_000 }),
	validator("json", async (body, c) => {
		const { output, success, issues } = v.safeParse(CreateTaskSchema, body);

		if (!success) {
			return c.json({ message: "Invalid request body", issues }, 400);
		}

		return output;
	}),
	async (c): Promise<Response> => {
		const db = c.get("db");
		const { tenantId, userId } = c.get("auth");
		const { title, status } = c.req.valid("json") as CreateTask;

		const inserted = await db
			.insert(tasks)
			.values({ title, status, tenantId })
			.returning();

		const created = inserted[0];

		if (!created) {
			return new Response(JSON.stringify({ error: "Internal error" }), {
				status: 500,
				headers: { "content-type": "application/json" },
			});
		}

		return c.json({ data: created }, 201);
	},
);

app.get("/tasks", async (c) => {
	const db = c.get("db");
	const { tenantId } = c.get("auth");

	try {
		const rows = await db
			.select()
			.from(tasks)
			.where(eq(tasks.tenantId, tenantId))
			.orderBy(desc(tasks.createdAt));

		return c.json({ data: rows }, 200);
	} catch (err) {
		console.error("GET /tasks failed", {
			tenantId,
			error: err,
		});

		return c.json({ error: "Internal server error" }, 500);
	}
});

export default app;
