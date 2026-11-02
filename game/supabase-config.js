// =============================================================
// Supabase 연결 설정 (STAR FIGHTER)
// -------------------------------------------------------------
// 1) Supabase 대시보드 > Project Settings > API 에서 값을 복사해 채우세요.
//    - URL        : "Project URL"
//    - anon key   : "Project API keys" 의 anon public 키
// 2) anon 키는 공개되어도 되는 클라이언트용 키입니다(RLS가 데이터를 보호).
//    service_role 키는 절대 프런트엔드에 넣지 마세요.
// 3) 값이 비어 있으면 게임은 자동으로 localStorage 전용 모드로 동작합니다.
// =============================================================

window.STARFIGHTER_SUPABASE = {
  url: 'https://plgifbhtbawrgueaiuzi.supabase.co',      // 예: 'https://xxxxxxxxxxxx.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZ2lmYmh0YmF3cmd1ZWFpdXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MDE4NzcsImV4cCI6MjEwOTE3Nzg3N30.frAdg6qSujgA5lyu4-ul-C5bkx7bxp_Efx1Xs2g5QxM'   // 예: 'eyJhbGciOi...'
};
