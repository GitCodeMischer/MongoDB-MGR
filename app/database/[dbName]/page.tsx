import { redirect } from "next/navigation"

export default function DatabasePage({
  params,
}: {
  params: { dbName: string }
}) {
  redirect(`/dashboard?db=${params.dbName}`)
} 