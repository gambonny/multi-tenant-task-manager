import { Hono } from "hono";
import { dbMiddleware } from "@/middleware/db";
import type { makeDbConnection } from "./db/client";

type Variables = {
	db: ReturnType<typeof makeDbConnection>;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", dbMiddleware);

app.get("/health", (c) => {
	const db = c.get("db");

	return c.json({
		ok: true,
	});
});

export default app;
