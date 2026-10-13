# kkh1902.github.io

김기훈 기술 블로그. Astro + GitHub Pages.

## 폴더 구조

```
src/
├── content/
│   └── blog/
│       ├── ai-dev/      # Claude Code, MCP 등 AI 개발 학습 기록
│       ├── projects/    # 실제로 만든 프로젝트 포트폴리오
│       └── career/      # 커리어 전환·회고
├── content.config.ts    # 글 frontmatter 스키마
├── layouts/
├── components/
├── pages/
│   ├── index.astro          # 홈 (최근 글)
│   ├── blog/index.astro     # 전체 글 목록
│   ├── blog/[...slug].astro # 글 상세
│   ├── category/[category].astro
│   ├── about.astro
│   └── rss.xml.js
└── styles/global.css
```

## 새 글 쓰기

`src/content/blog/<카테고리>/<slug>.md`에 아래 frontmatter로 작성한다.

```md
---
title: "제목"
description: "한 줄 설명"
pubDate: 2026-10-13
category: ai-dev   # ai-dev | projects | career
tags: ["태그1", "태그2"]
---

본문...
```

## 로컬 개발

```sh
npm install
npm run dev      # localhost:4321
npm run build    # ./dist/
npm run preview
```

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드 후
GitHub Pages에 배포한다. 저장소 Settings → Pages → Source를 **GitHub
Actions**로 설정해야 한다(최초 1회, 사람이 직접).
