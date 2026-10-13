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

| 단계/용어 | 비유 | 한줄 설명 |
|---|---|---|
| Prompt Engineering | 질문 잘 던지기 | 입력 문구 품질로 출력 개선 |
| Context Engineering | 책상에 자료 정리 | 창에 뭘·어떤 순서로 넣을지 설계 |
| Loop Engineering | 직원에게 위임+보고 체계 | Plan-Act-Observe 반복 설계 |
| Context Window | 책상 크기 | 모델이 한 번에 보는 토큰 범위 |
| Sub-agent | 전문 담당자 위임 | 별도 창에서 작업, 요약만 수신 |
| Context Compression | 회의록 요약 | 긴 로그를 요약해 창 비움 |

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

| 전환 | 한계 | 해결 |
|---|---|---|
| Prompt → Context | 모델 밖 정보(최신/내부 데이터) 부족 | RAG·메모리로 정보 자체를 주입 |
| Context → Loop | 한 번의 구성으론 멀티스텝 작업 못 끝냄 | Plan-Act-Observe 반복 |
| Loop 내부: 서브에이전트 | 컨텍스트 윈도우는 유한 | 탐색은 별도 창에 맡기고 요약만 수신 |
| Loop 내부: 컨텍스트 압축 | 반복할수록 로그 누적, 창 포화 | 오래된 로그를 요약해 창 비움 |

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
