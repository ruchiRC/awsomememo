import { config } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

// Windows 등에서 시스템 환경 변수 DATABASE_URL이 .env 보다 우선하면 이전 Supabase로 붙는 문제 방지
const root = dirname(fileURLToPath(import.meta.url))
config({ path: join(root, ".env"), override: true })

// Vercel: .env 없이 빌드되거나, 실수로 localhost URL이 들어가면 모바일/배포에서 로그인·회원가입 실패
// → 빌드 시점에 VERCEL_URL 기준으로 인증용 URL 보정
if (process.env.VERCEL === "1" && process.env.VERCEL_URL) {
  const origin = `https://${process.env.VERCEL_URL}`
  const looksLocal = (v) =>
    !v || /localhost|127\.0\.0\.1/i.test(v)
  if (looksLocal(process.env.NEXTAUTH_URL)) {
    process.env.NEXTAUTH_URL = origin
  }
  if (looksLocal(process.env.AUTH_URL)) {
    process.env.AUTH_URL = `${origin}/api/auth`
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel/Turbopack: Prisma를 번들에 넣지 않고 node_modules에서 로드 (.prisma/client/default 누락 방지)
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@prisma/adapter-pg",
    "pg",
  ],
}

export default nextConfig
