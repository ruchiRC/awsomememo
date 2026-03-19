import { config } from "dotenv"
import { resolve } from "path"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

config({ path: resolve(process.cwd(), ".env"), override: true })

const cs = process.env.DATABASE_URL

const adapter = new PrismaPg({
  connectionString: cs,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter })
try {
  const n = await prisma.user.count()
  console.log("DB OK, User count:", n)
} catch (e) {
  console.error("DB ERROR:", e.message, e.code ?? "")
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
