import { config } from "dotenv"
import { resolve } from "path"
import type { PrismaClient } from "@prisma/client"

// 시스템 DATABASE_URL이 오래된 값이면 .env가 이기도록
config({ path: resolve(process.cwd(), ".env"), override: true })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export function getDb(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    throw new Error(
      "DATABASE_URL이 비어 있습니다. .env에 Supabase PostgreSQL URI를 설정하세요."
    )
  }
  const { PrismaClient } = require("@prisma/client")
  const { PrismaPg } = require("@prisma/adapter-pg")
  const isSupabase = url.includes("supabase")
  // URL의 sslmode와 node-pg ssl 옵션이 겹치면 P1011(인증서)이 날 수 있어 Supabase는 sslmode 쿼리 제거 후 아래만 사용
  let connectionString = url
  if (isSupabase) {
    try {
      const parsed = new URL(url.replace(/^postgresql:/i, "http:"))
      parsed.searchParams.delete("sslmode")
      const q = parsed.searchParams.toString()
      const auth =
        parsed.username !== ""
          ? `${encodeURIComponent(parsed.username)}:${encodeURIComponent(parsed.password)}@`
          : ""
      connectionString = `postgresql://${auth}${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname}${q ? `?${q}` : ""}`
    } catch {
      connectionString = url.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?&/g, "?")
    }
  }
  const useSsl = isSupabase || process.env.NODE_ENV === "production"
  const adapter = new PrismaPg({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  })
  const client = new PrismaClient({ adapter })
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}
