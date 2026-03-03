import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";

const RootLayout = () => (
	<>
		<HeadContent />
		<Outlet />
		<Scripts />
	</>
);

export const Route = createRootRoute({ component: RootLayout });
