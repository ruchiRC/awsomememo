# Awesome Memo

Next.js 메모 앱 — Supabase(PostgreSQL) + Prisma + NextAuth.

## 시작하기

```bash
npm install
cp .env.example .env
# .env 에 DATABASE_URL, AUTH_SECRET, AUTH_URL 등 설정
npx prisma generate
npm run dev
```

DB 스키마·연결은 `docs/DATABASE.md`, Supabase 초기화 SQL은 `supabase-fresh-setup.sql` 참고.

## 환경 변수

`.env`는 Git에 올리지 마세요. `.env.example`을 복사해 사용합니다.
