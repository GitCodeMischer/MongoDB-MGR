import { redirect } from "next/navigation"

export default function ServerStatusPage() {
  redirect("/dashboard?view=server-status")
} 