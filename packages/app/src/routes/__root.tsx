import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => (
	<>
		<hr />
		<Outlet />
	</>
);

export const Route = createRootRoute({ component: RootLayout });
