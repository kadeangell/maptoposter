import { createRootRoute, Outlet } from "@tanstack/react-router"
import { NuqsAdapter } from "nuqs/adapters/tanstack-router"
import { Toaster } from "@/components/ui/sonner"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <NuqsAdapter>
      <Outlet />
      <Toaster position="bottom-right" />
    </NuqsAdapter>
  )
}
