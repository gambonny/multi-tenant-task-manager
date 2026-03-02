import { createMiddleware } from "hono/factory";
import type { AppEnv } from "@/env";

type Bucket = {
	count: number;
	resetAtMs: number;
};

const buckets = new Map<string, Bucket>();

function tooManyRequests(retryAfterSeconds: number) {
	return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
		status: 429,
		headers: {
			"content-type": "application/json",
			"retry-after": String(retryAfterSeconds),
		},
	});
}

export function rateLimit(opts?: {
	limit?: number;
	windowMs?: number;
	key?: (
		c: Parameters<Parameters<typeof createMiddleware<AppEnv>>[0]>[0],
	) => string;
}) {
	const limit = opts?.limit ?? 10;
	const windowMs = opts?.windowMs ?? 60_000;

	return createMiddleware<AppEnv>(async (c, next) => {
		const key = opts?.key?.(c) ?? `rl:${c.get("auth").userId}`;

		const now = Date.now();
		const b = buckets.get(key);

		if (!b || now >= b.resetAtMs) {
			buckets.set(key, { count: 1, resetAtMs: now + windowMs });
			return next();
		}

		if (b.count >= limit) {
			const retryAfterSeconds = Math.max(
				1,
				Math.ceil((b.resetAtMs - now) / 1000),
			);
			return tooManyRequests(retryAfterSeconds);
		}

		b.count += 1;
		return next();
	});
}
