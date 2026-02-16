# Consultation Booking System

상담사(Admin)와 요청자(Applicant)를 분리한 예약 시스템입니다.  
이 README 하나만으로 프로젝트 목적, 구조, 실행 방법, 핵심 규칙을 파악할 수 있게 작성했습니다.

## 1. 프로젝트 목적

- 상담사가 상담 가능 시간을 생성하고
- 요청자에게 1회성 예약 링크를 이메일로 발송하며
- 요청자가 링크를 통해 슬롯을 선택/확정하고
- 상담 완료 후 이력을 저장하는 흐름을 제공합니다.

핵심 비즈니스 규칙:

- 슬롯은 `30분 단위`로 생성
- 동일 슬롯 정원은 `최대 3명`
- 예약 링크는 `만료/재사용 불가` 정책 적용

## 2. 주요 사용자 흐름

### 상담사(Admin)

1. 회원가입/로그인
2. 특정 날짜에 30분 단위 슬롯 생성
3. 신청자 이름/이메일로 예약 링크 발송
4. 예약 현황 확인, 취소/완료 처리
5. 완료 건에 대해 상담 이력 작성

### 요청자(Applicant)

1. 이메일의 `reserve?token=...` 링크 접속
2. 예약 가능한 날짜/시간 조회
3. 슬롯 선택 후 예약 확정
4. 이미 만료/사용된 링크는 차단

## 3. 시스템 구성

```text
Admin Web (5173) ----\
                      \
                       -> Backend API (3000) -> PostgreSQL (55432)
                      /
Applicant Web (5174)-/
```

- Admin/Applicant는 별도 프론트엔드 앱
- Backend는 인증, 예약, 동시성 제어, 이력 저장 담당
- DB는 PostgreSQL 단일 인스턴스(개발환경 Docker)

## 4. 기술 스택

- Frontend: React 19, Vite, React Router, TanStack Query, Zustand
- Backend: NestJS 11, MikroORM, PostgreSQL
- Monorepo: pnpm workspace, Turbo
- Local Infra: Docker Compose

## 5. 저장소 구조

```text
apps/
  admin-web/        # 상담사 웹
  applicant-web/    # 요청자 웹
  backend/          # API 서버

packages/
  shared-ui/        # 공통 UI 컴포넌트
  shared-lib/       # 공통 유틸
  shared-types/     # 공통 타입 계약

infra/compose/
  docker-compose.dev.yml  # 로컬 PostgreSQL

scripts/
  db.ps1            # db up/down/status/logs 헬퍼
```

## 6. 로컬 실행 주소

- 관리자 웹: `http://localhost:5173`
- 요청자 웹: `http://localhost:5174`
- 백엔드 API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

## 7. 빠른 시작

사전 요구사항:

- Node.js 22+
- pnpm 10.29.3
- Docker Desktop

### 1) 의존성 설치

```bash
pnpm install
```

### 2) 환경 변수 생성

macOS/Linux:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Windows PowerShell:

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
```

### 3) DB 실행

```bash
pnpm db:up
```

### 4) 마이그레이션 적용

```bash
pnpm --filter backend migration:up
```

### 5) 전체 앱 실행

```bash
pnpm dev
```

## 8. 필수 환경 변수 (`apps/backend/.env`)

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=55432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=consultation_booking

JWT_ACCESS_SECRET=replace-with-strong-access-secret
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret

APPLICANT_RESERVE_BASE_URL=http://localhost:5174/reserve
```

SMTP는 실 메일 발송이 필요할 때만 설정:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

## 9. 라우트/API 요약

### 프론트 라우트

- Admin
  - `/login`
  - `/register`
  - `/dashboard`
- Applicant
  - `/reserve?token=...`
  - `/booking`

### 백엔드 엔드포인트(핵심)

- 인증: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- 스케줄: `POST /schedules`, `GET /schedules`, `PATCH /schedules/:id`, `DELETE /schedules/:id`
- 예약 링크: `POST /booking-links`
- 예약: `GET /bookings/available-slots`, `GET /bookings`, `POST /bookings`, `PATCH /bookings/:id/cancel`, `PATCH /bookings/:id/complete`
- 상담 이력: `POST /consultation-notes`, `GET /consultation-notes/:bookingId`

## 10. 주요 명령어

루트:

- `pnpm dev` : 전체 앱 병렬 실행
- `pnpm build` : 전체 빌드
- `pnpm lint` : 전체 린트
- `pnpm test` : 전체 테스트
- `pnpm db:up` : DB 시작
- `pnpm db:status` : DB 상태 확인
- `pnpm db:logs` : DB 로그 확인
- `pnpm db:down` : DB 종료

백엔드:

- `pnpm --filter backend dev`
- `pnpm --filter backend migration:up`
- `pnpm --filter backend migration:down`
- `pnpm --filter backend migration:list`
- `pnpm --filter backend test`

## 11. 품질/안전 장치

- JWT 기반 인증 + Refresh 토큰 재발급
- DTO/ValidationPipe로 입력 검증
- 링크 토큰 만료/재사용 방지
- 예약 처리 시 트랜잭션 기반 정합성 보장
- 슬롯 정원(capacity/booked_count) 규칙 강제

## 12. 트러블슈팅

### Docker 권한 오류

오류:

`open //./pipe/dockerDesktopLinuxEngine: Access is denied.`

해결:

1. 터미널을 관리자 권한으로 실행
2. 현재 Windows 계정을 `docker-users` 그룹에 추가 후 로그아웃/로그인

### DB 연결 실패

1. `pnpm db:status`로 `consultation-postgres` 상태 확인
2. `apps/backend/.env` DB 값 확인
3. 마이그레이션 적용 여부 확인: `pnpm --filter backend migration:up`
