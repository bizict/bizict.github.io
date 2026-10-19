유레카 프로젝트 이대환 교수의 깃허브 페이지입니다.

---

## SEO / GEO 구성 안내

이 사이트(`https://bizict.github.io/`)는 국민대 비즈니스IT전문대학원 ICB 트랙 홍보 페이지입니다. 검색엔진(SEO)과 생성형 AI 검색(GEO) 최적화를 위해 다음이 적용되어 있습니다.

### 적용된 항목

- **메타데이터** (`index.html` `<head>`): title/description, canonical, Open Graph, Twitter Card, robots, theme-color, 인라인 SVG favicon
- **구조화 데이터** (JSON-LD, `index.html` 하단): `EducationalOrganization`, `WebSite`, `Course`, `FAQPage`, `BreadcrumbList`
- **크롤러/AI 파일** (루트): `robots.txt`, `sitemap.xml`, `llms.txt`
- **접근성**: skip-link, `<main>` 랜드마크, 섹션 `aria-labelledby`, 탭/토글의 ARIA 상태, 장식 요소 `aria-hidden`
- **AI 친화 콘텐츠**: "한눈에 보는 ICB" 요약 섹션 + 질문형 FAQ 보강

### OG 공유 이미지

- `og-image.png`(1200 × 630px)가 생성되어 있으며, `index.html`의 `og:image` / `twitter:image`(`https://bizict.github.io/og-image.png`)에 연결되어 있습니다.
- 디자인 원본은 `og-image.svg`입니다. 문구·색상을 수정하려면 SVG를 편집한 뒤 PNG로 다시 내보내세요.
- **PNG 재생성 방법** (SVG 수정 후): 변환 도구가 없다면 SVG를 브라우저로 열어 1200×630으로 캡처하거나, headless Chrome으로 내보낼 수 있습니다.
  ```powershell
  # SVG를 1200x630 뷰포트 HTML로 감싼 뒤 아래 실행 (예시)
  & "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu `
    --window-size=1200,630 --force-device-scale-factor=1 `
    --screenshot="$PWD\og-image.png" "file:///$PWD/og-image.svg"
  ```

### 배포 후 검증 체크리스트

- [ ] [Google Search Console](https://search.google.com/search-console)에 `https://bizict.github.io/` 등록 후 `sitemap.xml` 제출
- [ ] [Rich Results Test](https://search.google.com/test/rich-results)로 JSON-LD(Course / FAQ) 인식 확인
- [ ] [Schema Markup Validator](https://validator.schema.org/)로 구조화 데이터 오류 점검
- [ ] [Facebook 공유 디버거](https://developers.facebook.com/tools/debug/) / [Twitter Card Validator](https://cards-dev.twitter.com/validator)로 공유 미리보기 확인
- [ ] Lighthouse(Chrome DevTools)로 SEO / 접근성 / 성능 점수 확인
- [ ] `/robots.txt`, `/sitemap.xml`, `/llms.txt`가 정상 응답하는지 확인

### 유지보수 메모

- 모집 일정·연락처·장학 조건 등 사실 정보는 **공식 홈페이지(bit.kookmin.ac.kr)** 기준으로 변경될 수 있습니다. 변경 시 다음 위치를 함께 갱신하세요.
  - `index.html` 본문(지원 일정, "한눈에 보는 ICB", FAQ)
  - `index.html` JSON-LD(`FAQPage`, `Course`)
  - `llms.txt`
  - `sitemap.xml`의 `<lastmod>`
- `galaga-index.html`은 별개의 게임 페이지로, SEO/GEO 작업 범위에 포함되지 않습니다(sitemap 제외).
