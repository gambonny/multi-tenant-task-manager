import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tenants/$tenantId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tenants/$tenantId"!</div>
}
