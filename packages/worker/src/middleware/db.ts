import { createMiddleware } from "hono/factory";
import type { AppEnv } from "@/env";
import { makeDbConnection } from "@/db/client";

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
	const databaseUrl = c.env.DATABASE_URL;
	if (!databaseUrl) throw new Error("DATABASE_URL binding missing");

	c.set("db", makeDbConnection(databaseUrl));
	await next();
});
