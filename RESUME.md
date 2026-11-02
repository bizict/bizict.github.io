# 다음 수업 복구 가이드 (공용 PC용)

> 이 PC는 수업마다 초기화됩니다. 이 문서는 **맨 PC에서 이전 작업을 이어받기 위한 출발점**입니다.
> 복구의 시작점이 GitHub 저장소 안에 있어야 하므로(순환 의존 방지), 이 파일은 일부러 저장소 루트에 둡니다.

## 0. 큰 그림: 무엇이 살아있고 무엇이 사라졌나

| 구분 | 항목 | 복구 방법 |
| --- | --- | --- |
| 클라우드(안전) | GitHub 저장소 전체 코드 | `git clone` |
| 클라우드(안전) | Supabase 프로젝트(DB·RLS·데이터) | 로그인만 하면 그대로 있음 |
| 클라우드(안전) | Notion 허브 페이지(프로젝트 기록) | 로그인만 하면 그대로 있음 |
| 로컬(소실) | Node.js (npx) | 아래 2번 (ZIP 재설치) |
| 로컬(소실) | Notion MCP 설정 | 아래 3번 (샘플 복사) |
| 로컬(소실) | Notion OAuth 로그인 | 아래 4번 (재로그인, 자동화 불가) |

살아남는 건 전부 클라우드에 있습니다. 로컬에서 사라지는 건 Node.js, MCP 설정, Notion 로그인뿐입니다.

## 1. 저장소 클론

```powershell
git clone https://github.com/bizict/bizict.github.io.git
cd bizict.github.io
```

## 2. Node.js 설치 (MCP 연결의 전제조건 — 자주 빠뜨리는 단계)

Notion MCP는 `npx mcp-remote`로 실행되므로 Node.js(npx)가 반드시 필요합니다. 공용 PC는 관리자 권한이 없을 수 있으니, 설치관리자 없이 **공식 ZIP을 사용자 폴더에 풀고 PATH에 등록**하는 방식이 가장 안전합니다.

```powershell
$u='https://nodejs.org/dist/v26.13.0/node-v26.13.0-win-x64.zip'
$z="$env:TEMP\node.zip"
$ProgressPreference='SilentlyContinue'
Invoke-WebRequest $u -OutFile $z -UseBasicParsing
Expand-Archive $z "$env:LOCALAPPDATA\node-tmp" -Force
$inner=(Get-ChildItem "$env:LOCALAPPDATA\node-tmp" -Directory)[0].FullName
Move-Item $inner "$env:LOCALAPPDATA\nodejs"
Remove-Item "$env:LOCALAPPDATA\node-tmp" -Recurse -Force
$p=[Environment]::GetEnvironmentVariable('Path','User')
[Environment]::SetEnvironmentVariable('Path',"$p;$env:LOCALAPPDATA\nodejs",'User')
```

> 주의: `winget`은 msstore 약관 프롬프트에서 멈추는 경우가 있고, MSI 직접 설치는 관리자 권한 없이 실패(1603/1310)할 수 있습니다. ZIP 방식이 가장 확실합니다. PATH 변경은 새 프로세스부터 적용되니 **설치 후 Kiro를 완전히 재시작**하세요.

## 3. Notion MCP 설정 복구

저장소의 샘플을 사용자 설정 위치로 복사합니다. (비밀값 없음)

- 복사 원본: `.kiro/mcp.sample.json`
- 붙여넣을 곳: `~/.kiro/settings/mcp.json`  (Windows: `C:\Users\<사용자>\.kiro\settings\mcp.json`)

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.kiro\settings" | Out-Null
Copy-Item ".kiro\mcp.sample.json" "$HOME\.kiro\settings\mcp.json" -Force
```

> **중요**: 샘플은 반드시 `command: npx` + `mcp-remote` 형식이어야 합니다. `url`만 적힌 형식은 Kiro(stdio 방식)에서 연결되지 않습니다. 샘플이 `url`만 있다면 먼저 고치세요.

## 4. Notion 재로그인 (OAuth — 수동, 자동화 불가)

Kiro를 재시작하면 MCP의 `notion` 서버가 연결을 시도하고 **브라우저에 Notion 로그인 창**이 뜹니다. 로그인 후 워크스페이스 접근을 승인하세요.

- OAuth 토큰은 보안상 공용 PC에 영구 저장하지 않습니다. 매번 재로그인은 정상입니다.
- 끝나면 Kiro에게 "허브 페이지 열어줘"라고 하면 맥락을 이어받습니다.

## 5. (선택) 로컬 미리보기

게임 모듈이 `import`를 쓰므로 `file://`이 아니라 HTTP로 열어야 합니다. Kiro/VS Code의 **Live Server** 확장이 가장 간단합니다. 또는 배포된 주소로 확인:

- 라이브 게임: https://bizict.github.io/galaga-index.html

## 6. 프로젝트 맥락은 어디에?

- **허브(Notion)**: "유레카프로젝트 2026-2 / 📘 유레카 강의보드" 안의 세션 기록 페이지. 진행 상황·결정·다음 할 일이 모두 여기 있음.
- **코드 복구 포인트**: 이 저장소. `supabase/schema.sql`(DB 스키마+RLS), `game/`(연동 코드), `galaga-index.html`(게임).

---

### 한눈 요약 (외울 4가지)
1. `git clone` → 2. Node.js ZIP 설치 → 3. MCP 샘플 복사 → 4. Kiro 재시작 후 Notion 재로그인. 끝.
