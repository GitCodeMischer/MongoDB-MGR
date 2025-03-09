import { redirect } from "next/navigation"

export default function CollectionPage({
  params,
}: {
  params: { dbName: string; collName: string }
}) {
  redirect(`/dashboard?db=${params.dbName}&collection=${params.collName}`)
} 