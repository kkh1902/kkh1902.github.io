---
title: Hermes Agent — Nous Research의 자기학습 AI 에이전트
date: '2026-05-10'
categories:
- AI
- Agents
tags:
- area/ai
- topic/ai
- type/concept
vault_synced: true
---

## 한 줄 요약

**Hermes Agent는 "쓰면 쓸수록 똑똑해지는" 오픈소스 AI 에이전트.** Nous Research가 만든 모델-무관(model-agnostic) 자율 에이전트로, IDE에 묶인 코딩 도구도 아니고 단순 챗봇 래퍼도 아님.

## Hermes 시리즈 전체 그림 먼저

헷갈리기 쉬운데, **Hermes는 두 갈래**:

```
Nous Research
    │
    ├─ Hermes 3 / Hermes 4   (LLM 모델)
    │   - Llama·Qwen 기반 fine-tune
    │   - function calling 강함
    │   - HuggingFace에서 다운로드
    │
    └─ Hermes Agent           (에이전트 프레임워크) ← 이 글
        - 모델 무관 (어떤 LLM이든 OK)
        - 자기학습 + 메모리 + 스킬 자동 생성
        - github.com/nousresearch/hermes-agent
```

이 글은 **Hermes Agent**(프레임워크) 위주.

## 다른 에이전트와 뭐가 다른가

```
[일반 코딩 에이전트]              [Hermes Agent]
(Cline, Cursor, Aider)
                                                
IDE에 종속                  →    IDE 독립
한 번 쓰고 끝              →    세션 간 메모리 누적
스킬 사람이 추가           →    에이전트가 자동 생성·개선
한 채널 (IDE)             →    20+ 채널 (CLI/Telegram/Slack/Discord/...)
모델 고정                  →    어떤 모델이든 (200+ 지원)
```

## 핵심 기능 5가지

### 1. 자기학습 루프 (Self-Improvement Loop)

```
사용 → 경험 축적 → 스킬 생성 → 다음 사용 시 활용 → 스킬 개선
   ↑                                              │
   └──────────────────────────────────────────────┘
```

- 처음엔 모름 → 한 번 가르치면 → 다음부턴 알아서
- 새 스킬 발견 시 자동 등록
- 기존 스킬도 사용 중 개선

### 2. 영구 메모리 + 사용자 프로파일링

| 메커니즘 | 역할 |
|---|---|
| **FTS5 풀텍스트 검색** | 과거 모든 대화 가로지르며 회상 |
| **LLM 요약** | 긴 대화를 압축해 컨텍스트 절약 |
| **Honcho 사용자 모델** | "이 사용자가 어떤 사람인지" 점진 학습 |

→ 매 세션이 0에서 시작 안 함. **나를 기억함.**

### 3. 다중 채널 게이트웨이

```
                  [Hermes Gateway]
                         │
   ┌────┬────┬────┬─────┼─────┬────┬────┐
   ▼    ▼    ▼    ▼     ▼     ▼    ▼    ▼
  CLI Telegram Discord Slack Signal WhatsApp Email Matrix
```

같은 에이전트, 같은 메모리. 어디서 말 걸어도 일관됨.

### 4. 모델 무관

```bash
hermes model     # 모델 전환 — 코드 수정 0
```

지원 백엔드:
- OpenAI, Anthropic, Nous Portal
- OpenRouter (200+ 모델)
- NVIDIA NIM, Ollama, 커스텀 endpoint

→ Hermes 3·4 LLM 권장이지만 **필수는 아님**.

### 5. 인프라 자유도

| 실행 위치 | 용도 |
|---|---|
| 로컬 | 개발·실험 |
| Docker | 격리 |
| SSH (원격 서버) | 항상 켜진 에이전트 |
| Modal / Daytona / Vercel | 서버리스 |
| Singularity | HPC 클러스터 |

## 작동 흐름

```
[Telegram에서 메시지]
    "오늘 회의 정리해서 노션에 올려줘"
                   │
                   ▼
        [Hermes Gateway]
                   │
                   ▼
        [Hermes Agent 코어]
            ├─ FTS5로 과거 대화 검색 ("회의 정리" 패턴 찾음)
            ├─ 사용자 프로파일 참조 ("이 사람은 ~한 형식 선호")
            ├─ 스킬 라이브러리에서 적합 스킬 로드
            ├─ MCP 서버 호출 (Notion API)
            └─ 결과 응답 + 새 스킬 학습
                   │
                   ▼
        [Telegram 답장]
```

## 빠른 셋업

```bash
# 설치
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# CLI 시작
hermes

# 다중 채널 게이트웨이
hermes gateway

# 모델 변경
hermes model
```

## 누구한테 적합한가

| 목적 | 적합도 |
|---|---|
| 다채널 봇 운영 (Telegram + Slack 등) | ⭐⭐⭐ |
| 장기 기억이 필요한 개인 비서 | ⭐⭐⭐ |
| 자기학습 실험 (RL 환경, 트레젝토리 수집) | ⭐⭐⭐ |
| 단순 코드 작성 헬퍼 | ⭐ (Cline/Cursor가 더 편함) |
| 일회성 스크립트 자동화 | ⭐ (오버킬) |

## 한계

- **셋업 무게**: 단순 코딩 도우미 대비 무거움
- **모델 비용**: 자율 운영 시 토큰 사용량 누적 (구독 모델 권장)
- **자기학습 품질**: 잘못된 스킬도 학습 가능 → 모니터링 필요
- **신생**: 생태계가 Cline·OpenHands 대비 작음

## 차이 요약 (Cline / OpenHands / Hermes)

| 항목 | Cline | OpenHands | Hermes Agent |
|---|---|---|---|
| 주 용도 | IDE 코딩 | 자율 코딩 | 멀티채널 자율 비서 |
| 메모리 | 세션별 | 세션별 | **영구 + 사용자 모델** |
| 스킬 생성 | 수동 | 수동 | **자동** |
| 채널 | VS Code | Web/Docker | **20+ (CLI 포함)** |
| MCP 지원 | ✅ | ✅ | ✅ |

## 결론

> **"내 비서 한 명을 키운다"는 컨셉을 가장 진지하게 구현한 오픈소스.**
> 코딩만 시킬 거면 Cline이 빠르고, 진짜 "오래 같이 갈 비서"가 필요하면 Hermes Agent.

## 참고

- [GitHub: nousresearch/hermes-agent](https://github.com/nousresearch/hermes-agent)
- [공식 문서](https://hermes-agent.nousresearch.com/docs/)
- [Hermes 3 모델 페이지 (별개)](https://nousresearch.com/hermes3)
- [Hermes 3 기술 보고서 (arxiv)](https://arxiv.org/pdf/2408.11857)

