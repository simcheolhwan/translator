import { createFileRoute } from "@tanstack/react-router"
import { ChatView } from "@/components/chat/ChatView"

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionPage,
})

function SessionPage() {
  const { sessionId } = Route.useParams()
  return <ChatView sessionId={sessionId} />
}
