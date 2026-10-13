---
title: "Claude Agent SDK의 서브에이전트(Subagent) — 컨텍스트를 왜, 어떻게 분리하나"
date: '2026-10-13 06:10:00 +0900'
categories:
- AI
- Claude
tags:
- Claude Agent SDK
- Subagent
- Claude Code
---

![서브에이전트가 컨텍스트를 나눠 처리하는 구조 이미지](/assets/img/posts/claude-agent-sdk-subagents/header.png)

## TL;DR

서브에이전트는 메인 에이전트가 특정 작업만 떼어서 맡기는 "별도의 대화 인스턴스"다.
목적은 하나 — **메인 에이전트의 컨텍스트 창을 오염시키지 않는 것**. 파일 수십 개를
뒤지는 작업을 서브에이전트에 시키면, 그 중간 과정(파일 내용·툴 결과)은 서브에이전트
안에만 남고 메인 에이전트는 최종 요약만 받는다.

## 비유 한 줄

팀장이 직접 자료를 다 읽지 않고 "이 부분만 조사해서 요약 보고해줘"라고 팀원에게
맡기는 것과 같다. 팀장(메인 에이전트)의 머릿속(컨텍스트)에는 조사 과정의 수백 페이지가
아니라 팀원이 올린 보고서 한 장만 남는다.

## 개념 표

| 용어 | 비유 | 한줄 설명 |
|---|---|---|
| Subagent | 파견 나간 팀원 | 메인 에이전트가 호출하는 독립된 대화 인스턴스. 끝나면 최종 메시지만 부모에게 반환 |
| Context isolation | 팀원의 업무 수첩 | 서브에이전트가 읽은 파일·실행한 툴 결과는 그 서브에이전트 안에만 쌓인다 |
| Programmatic definition | 그 자리에서 즉석 채용 | `query()`의 `agents` 파라미터로 코드에서 바로 정의(SDK 공식 권장) |
| Filesystem-based definition | 상시 고용된 전담 팀원 | `.claude/agents/*.md` 파일로 미리 정의해두고 여러 세션에서 재사용 |
| Fork | 팀원에게 내 수첩을 그대로 복사해주기 | 예외적으로 부모의 대화 기록 전체를 그대로 이어받는 방식 |
| Agent tool | 팀원 호출 버튼 | 메인 에이전트가 서브에이전트를 실행시키는 유일한 통로 |
| tools 제한 | 팀원에게 쥐어주는 권한 범위 | 생략하면 쓸 수 있는 툴 전부, 지정하면 그 목록만(예: 읽기 전용 리뷰어는 Read/Grep/Glob만) |

## 구조 다이어그램

```
[사용자 요청]
      │
      ▼
[메인 에이전트] ── Agent 툴 호출 ──▶ [서브에이전트 A: code-reviewer]
      │                                   │ (Read/Grep/Glob만 가능)
      │                                   ▼
      │                            파일 수십 개 조사 (컨텍스트는 여기 안에만 쌓임)
      │                                   │
      │◀───────────── 최종 요약 1건 ───────┘
      │
      └── Agent 툴 호출 ──▶ [서브에이전트 B: test-runner]  (A와 동시에 병렬 실행 가능)
                                  │ (Bash/Read/Grep 가능)
                                  ▼
                           테스트 실행 → 결과 분석
                                  │
      ◀───────────── 최종 요약 1건 ──┘
```

메인 에이전트가 받는 건 각 서브에이전트의 "최종 메시지"뿐이고, 중간에 읽은 파일·실행한
명령어 출력은 메인 쪽 대화에 전혀 쌓이지 않는다.

## 동작 원리(왜 이렇게 설계됐나)

| 질문 | 답 |
|---|---|
| 왜 컨텍스트를 분리해야 하나? | LLM의 컨텍스트 창은 유한하고, 불필요한 중간 결과가 쌓이면 뒤쪽 추론 품질이 떨어진다. 서브에이전트는 "조사는 거기서 끝내고 결론만 가져와"로 이 문제를 구조적으로 차단한다 |
| 왜 병렬 실행이 가능한가? | 서브에이전트는 서로 독립된 대화 인스턴스라 하나가 다른 것의 결과를 기다릴 이유가 없다. 코드 리뷰에서 style-checker·security-scanner·test-coverage를 동시에 돌리면 전체 시간이 "가장 느린 것 1개" 수준으로 줄어든다 |
| 왜 서브에이전트마다 다른 model/tools를 쓸 수 있나? | 역할마다 필요한 능력과 위험도가 다르기 때문. 보안 리뷰처럼 중요한 작업엔 더 비싼 모델(opus)을, 문서 리뷰처럼 읽기만 하면 되는 작업엔 Read/Grep만 줘서 실수로 파일을 고치는 사고 자체를 원천 차단한다 |
| programmatic vs filesystem, 뭘 써야 하나? | SDK로 앱을 만들 때는 `agents` 파라미터(코드) 방식이 공식 권장. 반면 Claude Code를 매번 비슷한 역할로 쓰는 경우엔 `.claude/agents/*.md`로 한 번 정의해두고 여러 세션에서 재사용하는 쪽이 편하다. 이름이 같으면 코드 쪽 정의가 파일 쪽을 덮어쓴다 |
| 서브에이전트가 또 서브에이전트를 부를 수 있나? | 가능하지만 무한히 깊어지면 비용이 통제가 안 되므로 `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`(기본 3단계)·`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`(기본 동시 20개)·`maxBudgetUsd`(총 예산) 세 축으로 상한을 건다 |

## 예시 코드 (Python)

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

async def main():
    async for message in query(
        prompt="인증 모듈을 보안 관점에서 리뷰해줘",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep", "Glob", "Agent"],
            agents={
                "code-reviewer": AgentDefinition(
                    description="보안·성능·유지보수성 리뷰 전담",
                    prompt="보안 취약점, 성능 이슈, 코딩 표준 준수를 확인하고 구체적으로 피드백해라.",
                    tools=["Read", "Grep", "Glob"],  # 읽기 전용 — 수정 불가
                    model="sonnet",
                ),
            },
        ),
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

`tools`를 `["Read", "Grep", "Glob"]`로만 제한했기 때문에, 이 서브에이전트는 아무리
설득력 있게 "이 줄을 고쳐야 한다"고 판단해도 실제로 파일을 고칠 수 없다 — 권한을
빼면 그 툴이 세션에 아예 없는 것으로 취급돼서, 에러도 권한 승인창도 없이 조용히
"그 행동을 못 하는 상태"가 된다.

## 요약 표

| 항목 | 내용 |
|---|---|
| 핵심 가치 | 컨텍스트 격리 + 병렬 실행 + 역할별 모델/툴 제한 |
| 메인이 받는 것 | 서브에이전트의 최종 메시지 1건 (중간 과정 비포함) |
| 정의 방법 2가지 | 코드(`agents` 파라미터, SDK 권장) / 파일(`.claude/agents/*.md`, 재사용 편리) |
| 호출 방법 2가지 | 자동 위임(description 기반 매칭) / 명시적 호출("code-reviewer 에이전트로 리뷰해줘") |
| 안전장치 3가지 | 깊이 제한(기본 3단계) · 동시 실행 제한(기본 20개) · 예산 제한(`maxBudgetUsd`) |
| 다음에 해볼 것 | `tools`를 비워서 "전체 권한" 서브에이전트와 "읽기 전용" 서브에이전트를 같은 작업에 병렬로 돌려 결과를 비교해보기 |

---
출처: [Claude Agent SDK — Subagents](https://code.claude.com/docs/en/agent-sdk/subagents.md)
