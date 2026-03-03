import * as v from "valibot";
import { Hono } from "hono";
import type { AppEnv } from "@/env";
import { dbMiddleware } from "@/middleware/db";
import { authMiddleware } from "@/middleware/auth";
import { rateLimit } from "@/middleware/rate-limiting";
import { validator } from "hono/validator";
import {
	CreateTaskSchema,
	TaskIdParamsSchema,
	type CreateTask,
	type TaskIdParams,
} from "@/schemas";
import { tasks } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { logger } from "@/middleware/logger";

const app = new Hono<AppEnv>();

app.use("*", logger({ appName: "TaskManager" }));
app.use("*", authMiddleware);
app.use("*", dbMiddleware);

app.get("/health", (c) => {
	const log = c.var.getLogger({ route: "health.handler" });
	const auth = c.get("auth");

	log.info("System operating", {
		event: "health:ok",
		scope: "health:handler",
		tenantId: auth.tenantId,
		userId: auth.userId,
	});

	return c.json({ ok: true, tenantId: auth.tenantId, userId: auth.userId });
});

app.post(
	"/tasks",
	rateLimit({ limit: 10, windowMs: 60_000 }),
	validator("json", (body, c) => {
		const log = c.var.getLogger({ route: "tasks.create.validator" });

		const { output, success, issues } = v.safeParse(CreateTaskSchema, body);

		if (!success) {
			log.warn("Validation failed ", {
				event: "tasks:create:validation:failed",
				scope: "validator:schema",
				issues,
			});

			return c.json({ error: "Invalid request body", issues }, 400);
		}

		return output;
	}),
	async (c): Promise<Response> => {
		const db = c.get("db");
		const { title, status } = c.req.valid("json") as CreateTask;
		const { tenantId, userId } = c.get("auth");

		const log = c.var.getLogger({
			route: "tasks.create.handler",
			tenantId,
			userId,
		});

		log.info("Saving started", {
			event: "tasks:create:started",
			scope: "handler:init",
		});

		try {
			const inserted = await db
				.insert(tasks)
				.values({ title, status, tenantId })
				.returning();

			const created = inserted[0];

			if (!created) {
				log.error("Task not inserted", {
					event: "tasks:create:db:no-row",
					scope: "db:insert",
				});

				return c.json({ error: "Internal server error" }, 500);
			}

			log.info("Creation succeeded", {
				event: "tasks:create:success",
				scope: "db:insert",
				taskId: created.id,
			});

			return c.json({ data: created }, 201);
		} catch (err) {
			log.error("Creation failed", {
				event: "tasks:create:failed",
				scope: "db:insert",
				error: err instanceof Error ? err.message : String(err),
			});

			return c.json({ error: "Internal server error" }, 500);
		}
	},
);

app.get("/tasks", async (c) => {
	const db = c.get("db");
	const { tenantId, userId } = c.get("auth");

	const log = c.var.getLogger({
		route: "tasks.list.handler",
		tenantId,
		userId,
	});

	log.info("Preparing retrieval", {
		event: "tasks:list:started",
		scope: "handler:init",
	});

	try {
		const rows = await db
			.select()
			.from(tasks)
			.where(eq(tasks.tenantId, tenantId))
			.orderBy(desc(tasks.createdAt));

		log.info("Listing succeeded", {
			event: "tasks:list:success",
			scope: "db:select",
			count: rows.length,
		});

		return c.json({ data: rows }, 200);
	} catch (err) {
		log.error("Listing failed", {
			event: "tasks:list:failed",
			scope: "db:select",
			error: err instanceof Error ? err.message : String(err),
		});

		return c.json({ error: "Internal server error" }, 500);
	}
});

app.delete(
	"/tasks/:id",
	validator("param", (params, c) => {
		const log = c.var.getLogger({ route: "tasks.delete.validator" });

		const { output, success, issues } = v.safeParse(TaskIdParamsSchema, params);

		if (!success) {
			log.warn("Validation failed", {
				event: "tasks:delete:validation:failed",
				scope: "validator:params",
				issues,
			});

			return c.json({ error: "Invalid request params", issues }, 400);
		}

		return output;
	}),
	async (c) => {
		const db = c.get("db");
		const { id } = c.req.valid("param") as TaskIdParams;
		const { tenantId, userId } = c.get("auth");

		const log = c.var.getLogger({
			route: "tasks.delete.handler",
			tenantId,
			userId,
			taskId: id,
		});

		log.info("Preparing deletion", {
			event: "tasks:delete:started",
			scope: "handler:init",
		});

		try {
			const deleted = await db
				.delete(tasks)
				.where(and(eq(tasks.id, id), eq(tasks.tenantId, tenantId)))
				.returning({ id: tasks.id });

			if (deleted.length === 0) {
				log.warn("Task Not found", {
					event: "tasks:delete:not-found",
					scope: "db:delete",
				});

				return c.json({ error: "Not found" }, 404);
			}

			log.info("Deletion succeeded", {
				event: "tasks:delete:success",
				scope: "db:delete",
			});

			return new Response(null, { status: 204 });
		} catch (err) {
			log.error("Deletion failed", {
				event: "tasks:delete:failed",
				scope: "db:delete",
				error: err instanceof Error ? err.message : String(err),
			});

			return c.json({ error: "Internal server error" }, 500);
		}
	},
);

app.notFound((c) => {
	const log = c.var.getLogger({ route: "system.not-found" });
	const auth = c.get("auth");

	log.warn("Route not found", {
		event: "http:404",
		scope: "http:not-found",
		tenantId: auth.tenantId,
		userId: auth.userId,
	});

	return c.json({ error: "Not found" }, 404);
});

app.onError((err, c) => {
	const log = c.var.getLogger({ route: "system.on-error" });
	const auth = c.get("auth");

	log.error("Unhandled error", {
		event: "http:500",
		scope: "http:on-error",
		tenantId: auth.tenantId,
		userId: auth.userId,
		error: err instanceof Error ? err.message : String(err),
	});

	return c.json({ error: "Internal server error" }, 500);
});

export default app;
