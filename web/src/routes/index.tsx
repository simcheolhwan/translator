import { createFileRoute } from "@tanstack/react-router"
import { ChatView } from "@/components/chat/ChatView"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  return <ChatView />
}
