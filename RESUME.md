# 다음 수업 복구 가이드 (공용 PC용)

> 이 PC는 수업마다 초기화됩니다. 이 문서는 **맨 PC에서 이전 작업을 이어받기 위한 출발점**입니다.
> 복구의 시작점이 GitHub 저장소 안에 있어야 하므로(순환 의존 방지), 이 파일은 일부러 저장소 루트에 둡니다.

## 0. 큰 그림: 무엇이 살아있고 무엇이 사라졌나

| 구분 | 항목 | 복구 방법 |
| --- | --- | --- |
| 클라우드(안전) | GitHub 저장소 전체 코드 | `git clone` |
| 클라우드(안전) | Supabase 프로젝트(DB·RLS·데이터) | 로그인만 하면 그대로 있음 |
| 클라우드(안전) | Notion 허브 페이지(프로젝트 기록) | 로그인만 하면 그대로 있음 |
| 로컬(소실) | Notion MCP 설정 | 아래 2번 (샘플 복사) |
| 로컬(소실) | Notion OAuth 로그인 | 아래 3번 (재로그인, 자동화 불가) |
| 로컬(소실) | git 커밋 신원 | 아래 4번 (저장소 로컬에만 설정) |

살아남는 건 전부 클라우드에 있습니다. 사라지는 건 **딱 3가지**(MCP 설정, Notion 로그인, git 신원)뿐입니다.

## 1. 저장소 클론

```powershell
git clone https://github.com/bizict/bizict.github.io.git
cd bizict.github.io
```

## 2. Notion MCP 설정 복구

저장소의 샘플을 사용자 설정 위치로 복사합니다. (비밀값 없음 — URL만 들어있음)

- 복사 원본: `.kiro/mcp.sample.json`
- 붙여넣을 곳: `~/.kiro/settings/mcp.json`  (Windows: `C:\Users\<사용자>\.kiro\settings\mcp.json`)

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.kiro\settings" | Out-Null
Copy-Item ".kiro\mcp.sample.json" "$HOME\.kiro\settings\mcp.json" -Force
```

> 참고: `~/.kiro/settings/mcp.json`은 민감할 수 있어 저장소에 커밋하지 않습니다. 그래서 "샘플을 복사"하는 방식입니다.

## 3. Notion 재로그인 (OAuth — 수동, 자동화 불가)

Kiro를 열면 MCP의 `notion` 서버가 연결을 시도하고 **브라우저에 Notion 로그인 창**이 뜹니다. 로그인 후 워크스페이스 접근을 승인하세요.

- OAuth 토큰은 보안상 PC에 영구 저장하지 않습니다(공용 PC에서는 더더욱). 매번 재로그인은 정상입니다.
- 끝나면 Kiro에게 "허브 페이지 열어줘" 또는 아래 허브 링크를 주면 맥락을 이어받습니다.

## 4. git 커밋 신원 (이 저장소에만 설정 — 전역 금지)

공용 PC에서 `--global`로 설정하면 **다음 사용자에게 내 신원이 남습니다.** 반드시 저장소 로컬로만 설정하세요.

```powershell
git config user.name "Dustin D. Lee"
git config user.email "gizmobox@gmail.com"
```

## 5. (선택) 로컬 미리보기

게임 모듈이 `import`를 쓰므로 `file://`이 아니라 HTTP로 열어야 합니다. Kiro/VS Code의 **Live Server** 확장이 가장 간단합니다. 또는 그냥 배포된 주소로 확인:

- 라이브 게임: https://bizict.github.io/galaga-index.html

## 6. 프로젝트 맥락은 어디에?

- **허브(Notion)**: "유레카프로젝트 2026-2 / 📘 유레카 강의보드" 안의 세션 기록 페이지. 진행 상황·결정·다음 할 일이 모두 여기 있음.
- **코드 복구 포인트**: 이 저장소. `supabase/schema.sql`(DB 스키마+RLS), `game/`(연동 코드), `galaga-index.html`(게임).

---

### 한눈 요약 (외울 3가지)
1. `git clone` → 2. MCP 샘플 복사 → 3. Notion 재로그인. 끝.
