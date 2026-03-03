import { useLogger } from "@gambonny/cflo";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "@/env";

export function logger({ appName }: { appName: string }) {
	return createMiddleware<AppEnv>(async (c, next) => {
		return useLogger({
			level: c.env.LOG_LEVEL,
			format: c.env.LOG_FORMAT,
			context: {
				appName,
				deployId: c.env.CF_VERSION_METADATA?.id ?? "unknown",
			},
		})(c, next);
	});
}
