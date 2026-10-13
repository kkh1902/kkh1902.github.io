---
title: "AI 엔지니어링의 변천사 — Prompt → Context → Loop Engineering"
date: '2026-10-13 07:40:00 +0900'
categories:
- AI
- Agent Engineering
tags:
- Prompt Engineering
- Context Engineering
- Agent Engineering
- Claude Code
---

![Prompt Context Loop Engineering 변천사](/assets/img/posts/prompt-context-loop-engineering/header.png)

## TL;DR

LLM을 잘 쓰는 기술의 중심은 3번 이동했다 — "질문 한 줄을 잘 쓰는 법"(Prompt Engineering)
→ "컨텍스트 윈도우 전체를 뭘로 채울지 설계하는 법"(Context Engineering) →
"에이전트가 스스로 계획-실행-관찰을 반복하게 만드는 법"(Loop/Agent Engineering). 각
단계는 이전 단계의 한계를 메우려다 생겼고, Claude Code의 서브에이전트·컨텍스트 압축·
도구 호출 루프가 지금 단계(Loop Engineering)를 가장 잘 보여주는 실제 사례다.

## 비유 한 줄

Prompt Engineering은 "질문을 잘하는 법"을 배우는 단계, Context Engineering은 "회의 전에
필요한 자료를 책상 위에 정리해두는 법"을 배우는 단계, Loop Engineering은 "직원 한 명에게
프로젝트 전체를 맡기고 알아서 계획-실행-보고를 반복하게 하는 법"을 설계하는 단계다.

## 개념 표

| 단계 | 비유 | 한줄 설명 |
|---|---|---|
| Prompt Engineering | 질문을 잘 던지는 기술 | 한 번의 입력(프롬프트) 문구를 다듬어 출력 품질을 끌어올림 |
| Few-shot | 예시 답안을 먼저 보여주기 | 프롬프트 안에 입출력 예시 몇 개를 넣어 패턴을 모방하게 함 |
| CoT (Chain-of-Thought) | "차근차근 풀어봐"라고 시키기 | 중간 추론 과정을 쓰게 유도해 복잡한 문제 정답률을 올림 |
| Context Engineering | 책상 위에 필요한 자료만 정리해두기 | 컨텍스트 윈도우에 무엇을(RAG 결과·메모리·도구 출력) 어떤 순서로 넣을지 설계 |
| Context Window | 책상(작업 공간)의 크기 | 모델이 한 번에 볼 수 있는 토큰의 최대 범위 |
| Context Compression | 회의록 요약해서 다시 책상에 올리기 | 길어진 대화/로그를 요약해 창을 비우고 핵심만 유지 |
| Loop/Agent Engineering | 직원에게 일을 맡기고 보고 체계를 설계하기 | 계획(Plan)→도구 실행(Act)→결과 관찰(Observe)을 반복하는 루프 자체를 설계 |
| Sub-agent | 전문 담당 직원에게 위임하기 | 특정 작업만 맡는 별도 컨텍스트의 에이전트를 호출해 본 대화 창을 아끼는 구조 |

## 구조 다이어그램

```
[1세대] Prompt Engineering
사용자 → "잘 쓴 질문 한 줄(+예시, +CoT)" → [LLM] → 답변 1회

[2세대] Context Engineering
            ┌─ 검색된 문서(RAG)
사용자 질문 ─┼─ 과거 대화 메모리      ──→ [컨텍스트 윈도우 설계] → [LLM] → 답변
            ├─ 도구 호출 결과
            └─ 시스템/역할 지시

[3세대] Loop Engineering (Agent Engineering)
[목표 입력]
   → Plan(계획 수립)
   → Act(도구 호출: 파일 읽기/코드 실행/서브에이전트 위임)
   → Observe(결과 관찰 → 컨텍스트에 반영, 길어지면 압축)
   → 목표 달성? ─ No → Plan으로 되돌아가 반복
                └ Yes → 최종 응답
```

## 동작 원리 (왜 다음 단계로 넘어갔나?)

| 질문 | 답 |
|---|---|
| 왜 Prompt Engineering만으로는 한계가 있었나? | 프롬프트를 아무리 잘 써도 모델이 "모르는 것"(최신 정보, 내부 문서, 긴 대화 이력)은 못 채운다 — 입력 한 줄의 품질로는 지식 부족 문제 자체를 못 풂 |
| 왜 Context Engineering이 등장했나? | RAG·메모리·도구 결과처럼 모델 밖에 있는 정보를 "어떻게 가져와 어떤 순서로 창에 배치할지"가 답변 품질을 더 크게 좌우한다는 게 드러났기 때문 — 문제의 중심이 "문구"에서 "자료 구성"으로 이동 |
| 왜 Context Engineering만으론 또 부족했나? | 멀티스텝 작업(코드 수정→테스트→재수정처럼 여러 번 주고받아야 끝나는 일)은 한 번의 컨텍스트 구성으로 안 끝난다 — 중간 결과를 보고 다음 행동을 스스로 정하는 반복(Loop)이 필요해짐 |
| 왜 서브에이전트로 쪼개나? | 메인 대화의 컨텍스트 윈도우는 유한하다 — 탐색·리서치처럼 토큰을 많이 쓰는 작업을 별도 컨텍스트(서브에이전트)에 맡기고 요약된 결과만 받아오면 메인 루프의 창을 오래 깨끗하게 유지할 수 있다 |
| 왜 컨텍스트 압축이 루프 엔지니어링의 핵심 기술인가? | 루프가 반복될수록 도구 호출 로그·중간 결과가 쌓여 창이 꽉 찬다 — 오래된 세부사항을 요약으로 대체하지 않으면 루프 자체가 길게 못 돌고 중간에 맥락을 잃는다 |

## 예시 — Claude Code로 본 3단계

Claude Code 자체가 세 단계를 한 세션 안에서 다 보여준다.

```text
1) Prompt Engineering 흔적
   사용자: "이 버그 고쳐줘. 단계별로 생각하면서 설명도 같이 해줘" (CoT 유도)

2) Context Engineering 동작
   Claude Code가 자동으로 컨텍스트 윈도우에 채워 넣는 것들:
   - CLAUDE.md(프로젝트 규칙) — 시스템 지시에 해당하는 "정리된 자료"
   - Read/Grep 결과 — 코드베이스에서 끌어온 RAG 비슷한 역할
   - 이전 도구 호출 로그 — 단기 메모리

3) Loop Engineering 동작
   Plan: "파일 A를 먼저 읽고 원인을 찾자"
     → Act: Read(A) 호출
     → Observe: 읽은 내용으로 원인 추정, 컨텍스트에 반영
     → Plan: "수정 후 테스트 실행이 필요하다"
     → Act: Edit + Bash(test) 호출
     → Observe: 테스트 실패 로그 확인
     → Plan: 재수정 (반복)
   ... 대화가 길어지면 Claude Code가 오래된 도구 로그를 요약(compact)해
       창을 비우고 루프를 계속 이어감 — 이게 "Context Compression"이
       "Loop Engineering" 안의 한 부품으로 들어간 모습이다.
```

## 요약 표

| 단계 | 핵심 질문 | 핵심 기법 | 한계(다음 단계로 넘어간 이유) |
|---|---|---|---|
| Prompt Engineering | 질문을 어떻게 쓸까? | Few-shot, CoT, 역할 지정 | 모델 밖 정보(최신/내부 데이터)를 못 채움 |
| Context Engineering | 창에 뭘 채울까? | RAG, 메모리, 도구 결과 주입, 압축 | 한 번의 구성으로는 멀티스텝 작업을 못 끝냄 |
| Loop/Agent Engineering | 반복을 어떻게 설계할까? | Plan-Act-Observe 루프, 서브에이전트, 동적 압축 | (현재 진행형 — 긴 루프의 안정성·비용·오류 복구가 다음 과제) |

Sources:
- [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Claude Code documentation — Subagents](https://docs.claude.com/en/docs/claude-code/sub-agents)
