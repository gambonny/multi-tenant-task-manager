import { createMiddleware } from "hono/factory";
import { makeDbConnection } from "@/db/client";

export const dbMiddleware = createMiddleware(async (c, next) => {
	const databaseUrl = c.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL binding missing");
	}

	const db = makeDbConnection(databaseUrl);

	c.set("db", db);

	await next();
});
