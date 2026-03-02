import type { makeDbConnection } from "@/db/client";
import type { AuthContext } from "@/middleware/auth";

export type AppEnv = {
	Bindings: Env;
	Variables: {
		db: ReturnType<typeof makeDbConnection>;
		auth: AuthContext;
	};
};
