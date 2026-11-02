// =============================================================
// STAR FIGHTER — Supabase 연동 (인증 + 점수 저장 + 리더보드)
// -------------------------------------------------------------
// 설계 원칙: 점진적 향상(progressive enhancement)
//   - Supabase 설정이 없거나 네트워크가 실패해도 게임은 그대로 동작.
//   - 이 모듈은 전역 window.StarFighterCloud 하나만 노출.
//   - 게임 코드(galaga-index.html)는 이 모듈이 "있으면 쓰고 없으면 무시".
//
// 공개 API (모두 Promise 또는 안전한 no-op):
//   StarFighterCloud.ready        : boolean  (연동 활성 여부)
//   StarFighterCloud.init()       : Promise<void>
//   StarFighterCloud.signIn(name) : Promise<{ ok, name } | { ok:false }>
//   StarFighterCloud.signOut()    : Promise<void>
//   StarFighterCloud.getUser()    : { id, name } | null
//   StarFighterCloud.submitScore(payload) : Promise<{ ok }>
//   StarFighterCloud.topScores(limit)     : Promise<Array<{player_name, score, stage}>>
//   StarFighterCloud.onLeaderboard(cb)    : () => void  (구독 해제 함수 반환)
// =============================================================

(() => {
  'use strict';

  const CFG = (window.STARFIGHTER_SUPABASE || {});
  const ENABLED = !!(CFG.url && CFG.anonKey);
  const SUPABASE_ESM = 'https://esm.sh/@supabase/supabase-js@2';
  const NAME_KEY = 'starfighter_name';

  let client = null;
  let user = null;        // { id, name }
  let loaded = false;

  function savedName() {
    try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; }
  }
  function rememberName(name) {
    try { localStorage.setItem(NAME_KEY, name); } catch (e) { /* ignore */ }
  }

  // Supabase JS를 CDN에서 동적 import (빌드 도구 불필요).
  async function loadClient() {
    if (client || !ENABLED) return client;
    const mod = await import(/* @vite-ignore */ SUPABASE_ESM);
    client = mod.createClient(CFG.url, CFG.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return client;
  }

  async function init() {
    if (!ENABLED || loaded) return;
    loaded = true;
    try {
      await loadClient();
      // 기존 세션 복원
      const { data } = await client.auth.getSession();
      if (data && data.session && data.session.user) {
        const u = data.session.user;
        user = { id: u.id, name: (u.user_metadata && u.user_metadata.player_name) || savedName() || 'PLAYER' };
      }
    } catch (e) {
      console.warn('[StarFighterCloud] init 실패, 로컬 모드로 동작:', e);
    }
  }

  // 익명 로그인 + 닉네임 저장. (소셜 로그인은 추후 확장)
  async function signIn(name) {
    const clean = String(name || '').trim().slice(0, 24) || 'PLAYER';
    if (!ENABLED) {
      rememberName(clean);
      user = { id: 'local', name: clean };
      return { ok: true, name: clean, local: true };
    }
    try {
      await loadClient();
      let session = (await client.auth.getSession()).data.session;
      if (!session) {
        const { data, error } = await client.auth.signInAnonymously();
        if (error) throw error;
        session = data.session;
      }
      // 닉네임을 user_metadata에 저장
      await client.auth.updateUser({ data: { player_name: clean } });
      rememberName(clean);
      user = { id: session.user.id, name: clean };
      return { ok: true, name: clean };
    } catch (e) {
      console.warn('[StarFighterCloud] signIn 실패:', e);
      return { ok: false };
    }
  }

  async function signOut() {
    user = null;
    if (!ENABLED || !client) return;
    try { await client.auth.signOut(); } catch (e) { /* ignore */ }
  }

  function getUser() { return user; }

  // 점수 1건 제출. 로그인 안 돼 있으면 조용히 실패(게임 흐름 방해 X).
  async function submitScore(payload) {
    if (!ENABLED || !client || !user || user.id === 'local') return { ok: false };
    const row = {
      user_id: user.id,
      player_name: user.name,
      score: Math.max(0, Math.floor(payload.score || 0)),
      stage: Math.max(1, Math.floor(payload.stage || 1)),
      shots: Math.max(0, Math.floor(payload.shots || 0)),
      hits: Math.max(0, Math.floor(payload.hits || 0))
    };
    try {
      const { error } = await client.from('scores').insert(row);
      if (error) throw error;
      return { ok: true };
    } catch (e) {
      console.warn('[StarFighterCloud] submitScore 실패:', e);
      return { ok: false };
    }
  }

  // 상위 점수 N개(사용자별 최고 1건, 공개 leaderboard 뷰 사용).
  async function topScores(limit) {
    const n = Math.max(1, Math.min(100, limit || 10));
    if (!ENABLED || !client) return [];
    try {
      const { data, error } = await client
        .from('leaderboard')
        .select('player_name, score, stage')
        .order('score', { ascending: false })
        .limit(n);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[StarFighterCloud] topScores 실패:', e);
      return [];
    }
  }

  // 리더보드 실시간 구독: scores에 insert가 생기면 콜백 호출.
  function onLeaderboard(cb) {
    if (!ENABLED || !client || typeof cb !== 'function') return () => {};
    let chan;
    try {
      chan = client
        .channel('public:scores')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'scores' },
            () => { cb(); })
        .subscribe();
    } catch (e) {
      console.warn('[StarFighterCloud] 실시간 구독 실패:', e);
      return () => {};
    }
    return () => { try { client.removeChannel(chan); } catch (e) { /* ignore */ } };
  }

  window.StarFighterCloud = {
    ready: ENABLED,
    savedName,
    init,
    signIn,
    signOut,
    getUser,
    submitScore,
    topScores,
    onLeaderboard
  };
})();
