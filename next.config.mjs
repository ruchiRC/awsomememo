import { config } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

// Windows 등에서 시스템 환경 변수 DATABASE_URL이 .env 보다 우선하면 이전 Supabase로 붙는 문제 방지
const root = dirname(fileURLToPath(import.meta.url))
config({ path: join(root, ".env"), override: true })

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
