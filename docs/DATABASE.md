# 데이터베이스 (Supabase만 사용)

- **앱은 PostgreSQL(Supabase)만 사용합니다.** 로컬 `dev.db`(SQLite)는 사용하지 않습니다.
- **로컬 SQLite → Supabase로 데이터 이전은 하지 않습니다.** 계정·메모는 Supabase에서 새로 만듭니다.

## Supabase를 처음부터 다시 구축할 때

1. Supabase 대시보드 → **SQL Editor**
2. 프로젝트 루트의 **`supabase-fresh-setup.sql`** 내용을 붙여넣고 **Run**

이 스크립트는 `Note`, `User`, `_prisma_migrations`를 삭제한 뒤 빈 테이블을 다시 만듭니다.

## 연결 설정

- `.env`의 `DATABASE_URL`에 Supabase **Connection string (URI)** + `?sslmode=require` 를 넣습니다.
- `lib/prisma.ts`는 `@prisma/adapter-pg`로 이 URL만 사용합니다.

### Windows에서 `.env`를 바꿨는데도 이전 DB로 붙을 때

PC에 **시스템 환경 변수 `DATABASE_URL`** 이 있으면, 기본 동작상 그 값이 `.env`보다 우선합니다.  
이 프로젝트는 `next.config.mjs` / `lib/prisma.ts` / `prisma.config.ts`에서 **`.env`를 `override: true`로 다시 읽어** 프로젝트 설정이 우선하도록 해 두었습니다.  
그래도 꼬이면 Windows **설정 → 시스템 → 정보 → 고급 시스템 설정 → 환경 변수**에서 예전 `DATABASE_URL`을 삭제하세요.

### P1001일 때: Session pooler로 바꾸기 (필수인 경우 많음)

`db.xxxxx.supabase.co:5432`(직접 연결)는 회사망·일부 ISP에서 막혀 **P1001**이 납니다. **호스트는 프로젝트마다 다르므로 직접 `aws-0-…`를 추측하지 마세요.** 대시보드에서 복사합니다.

1. [Supabase 대시보드](https://supabase.com/dashboard) → 해당 프로젝트  
2. **Connect** 버튼 클릭  
3. **ORM** 탭에서 **Prisma** 선택  
4. **Method** 를 **Session pool** (또는 Session mode, 포트 5432) 로 두기  
5. 표시된 **URI를 한 줄째로 통째로 복사** → `.env`의 `DATABASE_URL="..."` 값만 그걸로 교체  
6. 개발 서버 **재시작** → `/api/health/db` 에서 `ok: true` 확인  

복사한 URI에 `?sslmode=require`가 붙어 있어도 됩니다. 앱의 `lib/prisma.ts`에서 Supabase용으로 정리합니다.

### "Tenant or user not found" 가 나올 때

풀러 주소나 사용자 이름이 프로젝트와 안 맞을 때 나옵니다. **수동으로 만든** `aws-0-ap-northeast-2` 같은 호스트는 틀리기 쉽습니다. 위와 같이 **Connect → Prisma → Session pool** 에서 **복사한 URI만** 사용하세요. (일부 프로젝트는 `aws-1-…` 풀러 호스트를 씁니다.)

## 회원가입·로그인이 안 될 때 (P1001 등)

1. 브라우저에서 **`http://localhost:3001/api/health/db`** (포트는 본인 앱에 맞게) 를 엽니다.  
   - `ok: true` 이면 DB 연결은 되는 것이므로, 이메일·비밀번호·테이블 이름을 다시 확인합니다.  
   - `ok: false` 이고 `P1001` 이면 **PC에서 Supabase DB 포트로 나가는 연결이 막힌 것**입니다.

2. **직접 연결(`db.xxx.supabase.co:5432`)이 막힌 경우** (회사망·일부 가정용 ISP):

   - Supabase 대시보드 → **Project Settings → Database → Connection string**
   - **Session pooler** (또는 **Transaction**)용 URI를 복사합니다.  
     호스트가 `aws-0-…pooler.supabase.com` 형태이고 포트가 **5432(Session)** 또는 **6543(Transaction)** 인 경우가 많습니다.
   - `.env`의 `DATABASE_URL`을 그 URI로 바꿉니다.  
     Transaction pooler를 쓰는 경우 Prisma 문서에 따라 URL 끝에 `?pgbouncer=true` 등이 붙을 수 있습니다 — Supabase가 안내하는 문자열을 그대로 쓰는 것이 안전합니다.

3. 서버를 **재시작**한 뒤 다시 `/api/health/db` → 회원가입 순으로 확인합니다.

## Prisma 마이그레이션 (선택)

스키마는 `prisma/schema.prisma`와 위 SQL이 동일합니다. 로컬에서 DB에 접속 가능하면:

```bash
npx prisma migrate resolve --applied 20260319135716_init
```
