import type { Metadata } from "next"
import { Suspense } from 'react'
import DashboardView from "@/components/dashboard-view"

export const metadata: Metadata = {
  title: "MongoDB MGR",
  description: "Monitor your MongoDB databases and collections",
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardView />
    </Suspense>
  )
}

