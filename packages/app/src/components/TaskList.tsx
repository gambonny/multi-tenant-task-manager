import { useDeleteTaskMutation, useTasksSuspenseQuery } from "@/queries/tasks";
import type { Tenant } from "@/types";
import { formatToLocalString, getTenantErrorMessage } from "@/utils";

export function TaskList({ tenant }: { tenant: Tenant }) {
	const { data: tasks } = useTasksSuspenseQuery(tenant);
	const del = useDeleteTaskMutation(tenant);

	return (
		<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<div className="flex items-end justify-between gap-4">
				<div>
					<h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
					<p className="mt-1 text-sm text-slate-600">
						{tasks.length} task{tasks.length === 1 ? "" : "s"}
					</p>
				</div>
			</div>

			{tasks.length === 0 ? (
				<p className="mt-4 text-sm text-slate-600">
					No tasks yet. Add one above.
				</p>
			) : (
				<ul className="mt-4 divide-y divide-slate-200">
					{tasks.map((t) => {
						const deleting =
							del.isPending && String(del.variables) === String(t.id);

						return (
							<li key={String(t.id)} className="py-3">
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0">
										<p className="text-sm font-medium text-slate-900 truncate">
											{t.title}
										</p>

										<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
											<span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
												{t.status}
											</span>
											<span className="text-slate-500">
												{formatToLocalString(t.createdAt)}
											</span>
										</div>
									</div>

									<button
										type="button"
										onClick={() => del.mutate(t.id)}
										disabled={deleting}
										className={[
											"shrink-0 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium",
											"border border-slate-300 bg-white text-slate-900",
											"transition-colors hover:bg-slate-100",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
											"disabled:opacity-50 disabled:cursor-not-allowed",
										].join(" ")}
									>
										{deleting ? "Deleting..." : "Delete"}
									</button>
								</div>

								{del.isError && !del.isPending ? (
									<p role="alert" className="mt-2 text-sm text-red-600">
										{getTenantErrorMessage(del.error)}
									</p>
								) : null}
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
