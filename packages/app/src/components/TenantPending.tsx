export function TenantPending() {
	return (
		<div className="min-h-screen bg-slate-50 px-4 py-10">
			<main className="mx-auto w-full max-w-3xl">
				<header className="flex items-center justify-between">
					<div className="w-full max-w-sm">
						<div className="h-7 w-44 rounded-md bg-slate-200 animate-pulse" />
						<div className="mt-2 h-4 w-72 rounded-md bg-slate-200 animate-pulse" />
					</div>

					<div className="h-10 w-36 rounded-md bg-slate-200 animate-pulse" />
				</header>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="h-10 flex-1 rounded-md bg-slate-200 animate-pulse" />
						<div className="h-10 w-28 rounded-md bg-slate-200 animate-pulse" />
					</div>
					<div className="mt-3 h-4 w-56 rounded-md bg-slate-200 animate-pulse" />
				</section>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
						<div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
					</div>

					<ul className="mt-4 space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<li
								key={i}
								className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
							>
								<div className="flex items-center gap-3">
									<div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
									<div className="h-4 w-64 rounded bg-slate-200 animate-pulse" />
								</div>
								<div className="h-4 w-14 rounded bg-slate-200 animate-pulse" />
							</li>
						))}
					</ul>

					<div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
						<span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
						Loading tasks…
					</div>
				</section>
			</main>
		</div>
	);
}
