import type { Metadata } from "next"
import DashboardView from "@/components/dashboard-view"

export const metadata: Metadata = {
  title: "MongoDB Dashboard",
  description: "Monitor your MongoDB databases and collections",
}

export default function DashboardPage() {
  return <DashboardView />
}

