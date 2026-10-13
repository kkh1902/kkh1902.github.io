---
title: "Claude API skill: SDK 문서를 에이전트가 직접 찾아보게 하기"
date: '2026-10-13 05:00:00 +0900'
categories:
- AI
- Claude
tags:
- Claude
- Agent Skills
- Claude API
---

![Claude API skill 개념 이미지](/assets/img/posts/claude-api-skill/header.png)

## TL;DR

`claude-api`는 Claude Code에 기본 내장된 오픈소스 Agent Skill이다. Claude API(Messages API)와
Managed Agents로 뭔가 만들 때, 언어별 SDK 문서·베스트 프랙티스·모델 마이그레이션 절차를
Claude가 "필요한 만큼만" 찾아 읽게 해준다 — 매번 공식 문서를 웹서치로 다시 뒤지지 않아도 된다.

## 비유 한 줄

사내 신입 개발자 옆에 "이 회사 API 사용법을 꿰고 있는 시니어"를 앉혀둔 것과 같다.
묻지 않아도 코드에서 `anthropic` SDK를 쓰는 걸 보면 알아서 끼어들고, 필요한 챕터만
딱 펼쳐 보여준다.

## 개념 표

| 용어 | 비유 | 한줄 설명 |
|---|---|---|
| Agent Skill | 전문 분야별 사내 매뉴얼 | 특정 작업에 필요한 지식·절차를 묶어둔 패키지, 필요할 때만 로드 |
| Progressive disclosure | 목차부터 보고 필요한 장만 펼침 | 언어·작업 종류에 맞는 문서만 불러와 컨텍스트를 아낌 |
| Messages API | 전화 한 통 거는 방식 | 단건 요청·스트리밍·툴 사용 등 범용 Claude API 호출 |
| Managed Agents (베타) | 호텔 컨시어지에게 위임 | Anthropic이 상태·툴 실행까지 서버에서 관리해주는 에이전트 |
| 모델 마이그레이션 서브커맨드 | 자동 코드 리팩터 봇 | `/claude-api migrate`로 모델 교체 시 깨지는 파라미터를 찾아 고쳐줌 |

## 구조 다이어그램

```
[내 코드/요청]
   ├─ "anthropic SDK import" 감지         → 자동 활성화
   ├─ "/claude-api" 수동 호출             → 수동 활성화
   └─ "claude-opus-5-5로 옮겨줘" 같은 요청 → migrate 서브커맨드
        ↓
   [claude-api 스킬]
        ├─ 언어 감지 (requirements.txt / tsconfig.json / go.mod ...)
        ├─ 작업 종류 판단 (스트리밍? 배치? 캐싱? Managed Agents?)
        └─ 해당 문서 조각만 로드 (8개 언어 × Messages API/Managed Agents)
        ↓
   [Claude] → 그 문서 기준으로 코드 작성/수정/마이그레이션
```

## 동작 원리 (왜 이렇게?)

| 질문 | 답 |
|---|---|
| 왜 문서 전체를 한 번에 안 주나? | 모든 언어·모든 기능 문서를 다 넣으면 컨텍스트가 커져 정작 중요한 코드 맥락이 밀려난다. 프로젝트 파일로 언어를 추론해 필요한 조각만 로드한다. |
| 왜 "모델 마이그레이션"을 따로 다루나? | Opus/Sonnet/Haiku 신모델이 나올 때마다 `temperature` 제거, `thinking` 파라미터 구조 변경 같은 breaking change가 생긴다. 이걸 사람이 매번 변경 로그를 뒤져 고치는 대신, 스킬이 파일을 caller/모델 정의/문자열 참조로 분류해 자동 치환한다. |
| Managed Agents는 왜 별도 섹션인가? | 상태를 서버가 들고 있고 세션 재연결·interrupt 처리 같은 패턴이 Messages API와 달라서, "에이전트는 한 번만 만들고 세션은 매번 새로 연다"는 멘탈모델 자체를 인터뷰 형식으로 알려줘야 한다. |

## 최소 예시

```bash
# Claude Code에선 설치 없이 바로 호출
/claude-api

# 특정 모델로 코드베이스 전체 마이그레이션
/claude-api migrate this project to claude-opus-5-5

# Claude Code가 아닌 다른 환경에 설치
npx skills add https://github.com/anthropics/skills --skill claude-api
```

## 요약 표

| 항목 | 내용 |
|---|---|
| 뭐하는 스킬인가 | Claude API/Managed Agents용 SDK 문서·베스트 프랙티스를 필요한 만큼만 불러오는 스킬 |
| 지원 언어 | Python/TS/C#/Go/Java/PHP/Ruby/cURL (8개) |
| 언제 켜지나 | SDK import 감지 시 자동, `/claude-api`로 수동 |
| 대표 기능 | SDK 가이드, 모델 마이그레이션(`migrate`), preserved-thinking 점검, Managed Agents 온보딩 |
| 다음에 해볼 것 | 내 프로젝트에서 `/claude-api migrate`로 실제 모델 교체 자동화를 테스트해보기 |

원문: [Claude API skill 공식 문서](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill)
