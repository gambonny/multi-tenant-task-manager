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
		const log = c.var.getLogger({ route: "rate-limit.middleware" });
		const auth = c.get("auth");

		if (!auth) {
			log.error("rate-limit:auth-missing", {
				event: "rate-limit:auth:missing",
				scope: "rate-limit:middleware:precondition",
			});

			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { "content-type": "application/json" },
			});
		}

		const key = opts?.key?.(c) ?? `rl:${auth.userId}`;

		const now = Date.now();
		const b = buckets.get(key);

		if (!b || now >= b.resetAtMs) {
			buckets.set(key, { count: 1, resetAtMs: now + windowMs });

			log.debug("rate-limit:window:reset", {
				event: "rate-limit:window:reset",
				scope: "rate-limit:fixed-window",
				limit,
				windowMs,
				key,
			});

			return next();
		}

		if (b.count >= limit) {
			const retryAfterSeconds = Math.max(
				1,
				Math.ceil((b.resetAtMs - now) / 1000),
			);

			log.warn("rate-limit:blocked", {
				event: "rate-limit:blocked",
				scope: "rate-limit:fixed-window",
				limit,
				windowMs,
				key,
				count: b.count,
				retryAfterSeconds,
			});

			return tooManyRequests(retryAfterSeconds);
		}

		b.count += 1;

		log.debug("rate-limit:allowed", {
			event: "rate-limit:allowed",
			scope: "rate-limit:fixed-window",
			limit,
			windowMs,
			key,
			count: b.count,
		});

		return next();
	});
}
