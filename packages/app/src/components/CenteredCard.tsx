import type { ReactNode } from "react";

type CenteredCardProps = {
	title: string;
	children: ReactNode;
	actions?: ReactNode;
};

export function CenteredCard({ title, children, actions }: CenteredCardProps) {
	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md rounded-xl bg-white shadow-sm border border-slate-200 p-8 text-center">
				<h1 className="text-xl font-semibold text-slate-900">{title}</h1>
				{children}
				{actions ? <div className="mt-6">{actions}</div> : null}
			</div>
		</div>
	);
}
