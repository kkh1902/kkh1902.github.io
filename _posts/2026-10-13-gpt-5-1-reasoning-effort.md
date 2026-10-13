---
title: "GPT-5.1의 reasoning_effort, Claude의 extended thinking과 뭐가 다른가"
date: '2026-10-13 11:00:00 +0900'
categories:
- AI
- ChatGPT
tags:
- ChatGPT
- OpenAI
- Claude
- 모델비교
---

![GPT와 Claude가 각자 다이얼을 돌려 생각의 양을 조절하는 모습](/assets/img/posts/gpt-5-1-reasoning-effort/header.png)

## 한 줄

GPT-5.1과 Claude는 둘 다 "얼마나 깊게 생각할지"를 API 파라미터로 조절하게 해주는데,
OpenAI는 `reasoning_effort`라는 단계값(none/low/medium/high)으로, Anthropic은
`thinking.budget_tokens`라는 토큰 예산으로 이 다이얼을 만든다 — 같은 목적, 다른 손잡이.

## 비유 한 줄

`reasoning_effort`는 "4단계 냉방 강도(약/중/강/최강) 버튼"이고, `thinking.budget_tokens`는
"에어컨에 몇 와트까지 쓸지 직접 숫자로 입력하는 것"에 가깝다 — 전자는 쓰기 쉽고, 후자는
더 세밀하게 조절할 수 있다.

## 개념 표

| 용어 | 비유 | 한줄 설명 |
|---|---|---|
| `reasoning_effort` | 냉방 강도 버튼 | GPT-5.1 API 파라미터, `none`/`low`/`medium`/`high` 4단계로 추론량을 조절 |
| extended thinking | 에어컨 와트 수 직접 입력 | Claude API의 `thinking` 블록, `budget_tokens`로 추론에 쓸 토큰 양을 직접 지정 |
| adaptive reasoning | 실내 온도 보고 알아서 세기 조절 | 모델이 질문 난이도를 보고 내부적으로 추론량을 동적 배분하는 방식(GPT-5.1의 핵심 설계 방향) |
| context window | 책상 위에 펼쳐둘 수 있는 종이 양 | 모델이 한 번에 참고할 수 있는 토큰 수. GPT-5.1은 40만 토큰 |

## 구조 다이어그램

```
[사용자 질문]
      │
      ▼
[reasoning_effort 설정] ── none  → 거의 바로 답변 (저지연, 저비용)
                        ── low   → 가벼운 추론
                        ── medium→ 기본값 수준 추론
                        └─ high  → 깊은 추론 (고지연, 고비용)
      │
      ▼
[모델이 내부적으로 "생각 토큰"을 소비]
      │
      ▼
[최종 답변 토큰 출력] (최대 128,000 토큰)
```

Claude 쪽은 effort 단계 대신 토큰 숫자를 직접 준다:

```
[사용자 질문] → [thinking.budget_tokens = N] → [모델이 최대 N토큰까지 사고 과정 생성] → [최종 답변]
```

## 동작 원리(왜?)

| 질문 | 답 |
|---|---|
| 왜 매번 최고 성능으로 안 돌리나? | 깊은 추론일수록 토큰을 더 많이 쓰고 응답이 느려진다 — 간단한 질문에 `high`를 쓰면 비용·지연만 늘고 품질 차이는 미미하다 |
| `none`이면 추론을 아예 안 하나? | OpenAI 문서 기준 `none`이 기본값 — 복잡한 작업엔 단계를 올려야 한다는 뜻이지, 모델 자체가 추론 능력이 없다는 뜻은 아니다 |
| 왜 OpenAI는 단계(4개), Anthropic은 숫자(토큰)를 택했나 | 공식 문서로 교차 확인은 못 했지만, 단계값은 "뭘 골라야 할지 고민을 줄여주는" 사용 편의 설계이고, 토큰 예산은 "정확히 얼마나 쓸지 통제하고 싶은" 엔지니어링 편의 설계로 보인다(지어내지 않기 위해 추정임을 명시) |

## 예시: GPT-5.1 reasoning_effort 호출

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.1",
    input="이 코드의 시간복잡도를 분석하고 더 빠른 알고리즘을 제안해줘.",
    reasoning={"effort": "high"},  # none | low | medium | high
)

print(response.output_text)
```

Claude의 대응 코드는 토큰 예산을 직접 넣는다:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=4096,
    thinking={"type": "enabled", "budget_tokens": 8000},
    messages=[{"role": "user", "content": "이 코드의 시간복잡도를 분석하고 더 빠른 알고리즘을 제안해줘."}],
)
```

## 요약 표

| 항목 | GPT-5.1 (`reasoning_effort`) | Claude (extended thinking) |
|---|---|---|
| 조절 단위 | 단계(none/low/medium/high) | 토큰 숫자(`budget_tokens`) |
| 기본값 | none | 비활성(명시적으로 켜야 함) |
| 컨텍스트 윈도우 | 400,000 토큰(공식 문서 확인, 2026-10) | 모델별 상이 — 호출 시점 공식 문서로 재확인 필요 |
| 최대 출력 | 128,000 토큰 | 모델별 상이 |
| 가격(참고, 변동 가능) | 입력 $1.25 / 출력 $10 (100만 토큰당, 캐시 입력 $0.125) | 모델별 공식 가격표 참고 |
| 확인 출처 | [developers.openai.com API 문서](https://developers.openai.com/api/docs/models/gpt-5.1) | Anthropic 공식 API 문서(Extended thinking) |

이 글의 가격·스펙은 2026-10-13 기준 공식 문서 조회 값이다 — AI 모델 스펙은 자주 바뀌므로
실제 사용 전엔 각 공식 문서에서 최신값을 다시 확인한다. GPT 차기 모델 계보(GPT-5.1 이후
버전)에 대한 정보는 검색 중 출처 신뢰도를 확인할 수 없어 이 글에는 넣지 않았다.
