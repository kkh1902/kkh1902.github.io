---
title: "RAG(검색 증강 생성)이 뭔지 한 번에 정리"
date: '2026-10-13 05:30:00 +0900'
categories:
- AI
- Agent Engineering
tags:
- RAG
- Agent Engineering
- Vector DB
---

![RAG 개념 이미지](/assets/img/posts/what-is-rag/header.png)

## TL;DR

RAG(Retrieval-Augmented Generation, 검색 증강 생성)는 LLM이 답하기 직전에 "참고자료부터
찾아보고" 답하게 만드는 구조다. 모델을 재학습시키지 않고도 최신 정보·내부 문서로
답변을 채울 수 있고, 환각(hallucination)을 줄이는 게 핵심 동기다.

## 비유 한 줄

오픈북 시험을 보는 학생이다. 머릿속 지식(모델 학습 내용)만으로 답하지 않고, 시험 중에
관련 페이지를 찾아 펼쳐본 뒤(검색/Retrieval) 그 내용을 바탕으로 답안을 쓴다(생성/Generation).

## 개념 표

| 용어 | 비유 | 한줄 설명 |
|---|---|---|
| Chunking | 책을 챕터 단위로 자르기 | 원본 문서를 검색하기 좋은 크기의 조각으로 나눔 |
| Embedding | 문장을 좌표로 바꾸기 | 텍스트를 의미가 가까우면 가까운 숫자 벡터로 변환 |
| Vector DB | 좌표별로 정리된 서랍장 | 임베딩 벡터를 저장하고 유사도로 빠르게 찾는 저장소 |
| Retrieval | 책장에서 관련 페이지 찾기 | 질문을 같은 방식으로 임베딩해 가장 가까운 조각을 꺼냄 |
| Augmented prompt | 교과서를 펼쳐놓고 답 쓰기 | 찾은 조각 + 원래 질문을 합쳐 LLM에 전달하는 프롬프트 |

## 구조 다이어그램

```
[인덱싱 단계 — 미리 해둠]
문서 묶음 → 청크로 분할 → 임베딩 모델 → [Vector DB]

[질의응답 단계 — 매 요청마다]
사용자 질문
   → 같은 임베딩 모델로 벡터화
   → [Vector DB]에서 유사 청크 top-K 검색
   → (질문 + 검색된 청크) 하나의 프롬프트로 결합
   → [LLM] → 근거 있는 답변
```

## 동작 원리 (왜?)

| 질문 | 답 |
|---|---|
| 왜 파인튜닝 대신 RAG인가? | 모델 가중치를 안 건드리고 외부 문서만 교체하면 된다 — 최신 정보가 매일 바뀌는 상황(내부 위키, 제품 문서)에 재학습 없이 대응 가능 |
| 왜 환각이 줄어드나? | 모델이 "기억에 의존해 지어내는" 대신 실제로 검색된 텍스트를 근거로 삼게 강제하기 때문. 다만 검색이 틀리면 틀린 근거로 그럴듯하게 답할 수 있다는 한계는 남는다 |
| 왜 청크 크기가 중요한가? | 너무 크면 관련 없는 내용이 섞여 들어가 LLM이 헷갈리고, 너무 작으면 문맥이 끊겨 검색 정확도가 떨어진다 |

## 최소 예시

```python
# 개념만 보여주는 의사코드
query_vector = embed(user_question)
top_chunks = vector_db.search(query_vector, k=3)

prompt = f"""
다음 참고자료를 바탕으로 질문에 답해줘:
{top_chunks}

질문: {user_question}
"""
answer = llm.generate(prompt)
```

## 요약 표

| 항목 | 내용 |
|---|---|
| 한 줄 정의 | 답변 전에 외부 자료를 검색해 LLM 프롬프트에 끼워 넣는 구조 |
| 핵심 동기 | 환각 감소, 재학습 없이 최신/내부 데이터 반영 |
| 3단계 | 인덱싱(청크+임베딩) → 검색(유사도) → 생성(LLM) |
| 약점 | 검색이 틀리면 답도 틀림, 멀티홉(여러 문서를 엮어야 하는) 질문엔 약함 |
| 다음에 볼 것 | 멀티홉 질문엔 어떤 구조가 더 맞는지 — Vector DB vs Graph DB 비교 글 참고 |

Sources:
- [Cloudflare AutoRAG — What is RAG](https://developers.cloudflare.com/autorag/concepts/what-is-rag)
- [arXiv: Systematic Review of RAG Systems](https://arxiv.org/pdf/2507.18910)
