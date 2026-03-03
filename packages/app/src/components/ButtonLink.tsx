import { Link, type LinkProps } from "@tanstack/react-router";
import type * as React from "react";

type ButtonLinkProps = LinkProps & {
	children: React.ReactNode;
	className?: string;
};

export function ButtonLink({
	children,
	className = "",
	...props
}: ButtonLinkProps) {
	return (
		<Link
			{...props}
			className={[
				"inline-flex items-center justify-center",
				"rounded-md px-6 py-3",
				"text-sm font-medium",
				"bg-slate-900 text-white",
				"transition-all duration-150",
				"hover:bg-slate-700",
				"focus-visible:outline-none",
				"focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
				"active:scale-98 active:translate-y-[1px]",
				className,
			].join(" ")}
		>
			{children}
		</Link>
	);
}
