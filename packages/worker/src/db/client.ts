import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function makeDbConnection(databaseUrl: string) {
	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required");
	}

	const sql = neon(databaseUrl);

	return drizzle(sql);
}
