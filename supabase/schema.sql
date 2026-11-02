-- =============================================================
-- STAR FIGHTER (galaga-index.html) — 1단계: 인증 + 클라우드 기록
-- Supabase Postgres 스키마 + RLS(행 수준 보안) 정책
-- =============================================================
-- 적용 방법:
--   Supabase 대시보드 > SQL Editor 에 이 파일 내용을 붙여넣고 실행.
--   (또는 supabase CLI: `supabase db push` 전에 마이그레이션으로 편입)
--
-- 설계 요약:
--   - scores: 플레이 1회의 결과(점수/스테이지/명중률 등)를 1행으로 저장.
--   - 읽기(select)는 누구나 가능 → 전역 리더보드용.
--   - 쓰기(insert)는 로그인한 본인(user_id = auth.uid())만 가능.
--   - update/delete 정책은 두지 않음 → 기록은 추가만 되고 사후 변조 불가(감사 용이).
--
-- !!! 보안 주의 !!!
--   RLS는 "누가 어느 행을 읽고 쓸 수 있는가"만 통제합니다.
--   클라이언트가 보낸 점수 값 자체의 진위(위변조)는 보장하지 못합니다.
--   현재 게임은 100% 클라이언트 사이드라 점수 조작이 자명하므로,
--   공개 랭킹을 "신뢰"하려면 아래 RLS와 별개로 서버 측 점수 검증
--   (예: Edge Function 경유 제출 + 세션/리플레이 검증)을 반드시 추가해야 합니다.
--   이 SQL은 1단계(기능 동작 + 최소 접근통제)까지만 커버합니다.
--
-- [2026-11-02 갱신] API 키 체계 변경 안내
--   Supabase는 레거시 anon/service_role 키를 2026년 말까지 단계적 폐지 중이며,
--   새 키 체계(sb_publishable_... / sb_secret_...)로 전환하고 있습니다.
--   2025-11-01 이후 생성된 신규 프로젝트에는 anon 키가 없을 수 있고,
--   클라이언트에는 publishable 키(sb_publishable_...)를 사용합니다.
--   이 변경은 DB 스키마/RLS와 무관하며(위 정책은 그대로 유효),
--   클라이언트 설정(game/supabase-config.js)에서 키만 맞춰주면 됩니다.
--   참고: https://supabase.com/docs/guides/getting-started/api-keys
-- =============================================================

-- 1) 테이블 -----------------------------------------------------
create table if not exists public.scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  player_name text not null check (char_length(player_name) between 1 and 24),
  score       integer not null check (score >= 0 and score <= 100000000),
  stage       integer not null default 1 check (stage >= 1 and stage <= 999),
  shots       integer not null default 0 check (shots >= 0),
  hits        integer not null default 0 check (hits >= 0),
  created_at  timestamptz not null default now()
);

comment on table public.scores is 'STAR FIGHTER 플레이 기록(플레이 1회 = 1행). 리더보드 소스.';

-- 2) 인덱스 -----------------------------------------------------
-- 전역 리더보드: 높은 점수 우선, 동점이면 먼저 달성한 기록 우선.
create index if not exists scores_leaderboard_idx
  on public.scores (score desc, created_at asc);

-- "내 기록" 조회용.
create index if not exists scores_user_idx
  on public.scores (user_id, score desc);

-- 3) RLS 활성화 -------------------------------------------------
alter table public.scores enable row level security;

-- 4) 정책 -------------------------------------------------------
-- 4-1) 읽기: 누구나(익명 포함) 모든 점수를 읽을 수 있음 → 공개 리더보드.
drop policy if exists "scores are viewable by everyone" on public.scores;
create policy "scores are viewable by everyone"
  on public.scores
  for select
  using (true);

-- 4-2) 쓰기: 로그인한 사용자가 "자기 자신의" 기록만 추가 가능.
--      with check 로 user_id 위조를 차단(남의 id로 insert 불가).
--      성능: auth.uid()를 (select auth.uid())로 감싸면 Postgres가 쿼리당 1회만
--      평가(init plan)하므로 행이 많아져도 비용이 선형으로 늘지 않음.
--      참고: Supabase RLS Performance and Best Practices
--      (https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
drop policy if exists "users can insert their own scores" on public.scores;
create policy "users can insert their own scores"
  on public.scores
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- update/delete 정책은 의도적으로 생성하지 않음.
-- → RLS가 켜진 상태에서 정책이 없으면 해당 작업은 전부 거부됨(기록 불변).

-- 5) 리더보드 뷰(선택) ------------------------------------------
-- 사용자별 "최고 점수 1건"만 모은 공개 랭킹 뷰.
-- 클라이언트에서 scores를 직접 정렬해도 되지만, 중복 사용자 제거가 편해짐.
create or replace view public.leaderboard as
select distinct on (user_id)
  user_id,
  player_name,
  score,
  stage,
  created_at
from public.scores
order by user_id, score desc, created_at asc;

comment on view public.leaderboard is '사용자별 최고 점수 1건 집계(공개 랭킹용). 표시 시 score desc로 정렬.';
