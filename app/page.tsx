import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { NotesApp } from "@/components/notes-app"

export default async function Page() {
  const session = await auth()
  if (!session) redirect("/login")
  return <NotesApp />
}
