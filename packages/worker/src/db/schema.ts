import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type TaskStatus = "todo" | "done";

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		status: text("status").$type<TaskStatus>().notNull().default("todo"),
		tenantId: text("tenant_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		tenantIdx: index("tasks_tenant_id_idx").on(t.tenantId),
	}),
);
