import ky from "ky"
import { getIdToken } from "@/lib/auth"

const API_URL = import.meta.env.VITE_API_URL || ""

export const api = ky.create({
  prefixUrl: API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getIdToken()
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      },
    ],
  },
})
