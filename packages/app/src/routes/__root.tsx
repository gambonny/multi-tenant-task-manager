import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

const RootLayout = () => (
	<>
		<HeadContent />
		<Outlet />
		<Scripts />
	</>
);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		component: RootLayout,
	},
);
