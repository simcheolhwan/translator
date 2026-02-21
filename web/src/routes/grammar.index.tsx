import { createFileRoute } from "@tanstack/react-router"
import { GrammarView } from "@/components/grammar/GrammarView"

export const Route = createFileRoute("/grammar/")({
  component: GrammarPage,
})

function GrammarPage() {
  return <GrammarView />
}
