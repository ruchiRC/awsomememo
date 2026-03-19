import { handlers } from "@/auth"

/** pg / Prisma 어댑터는 Node 런타임 필요 (Edge에서는 동작하지 않음) */
export const runtime = "nodejs"

export const { GET, POST } = handlers
