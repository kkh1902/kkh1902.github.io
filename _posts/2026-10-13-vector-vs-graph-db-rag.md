---
title: "Vector DB vs Graph DB, RAG에서 언제 뭘 쓰나"
date: '2026-10-13 06:00:00 +0900'
categories:
- AI
- Agent Engineering
tags:
- RAG
- Vector DB
- Graph DB
- Agent Engineering
---

![Vector DB와 Graph DB 비교 이미지](/assets/img/posts/vector-vs-graph-db-rag/header.png)

## TL;DR

"비슷한 걸 찾는" 질문이면 Vector DB가 기본값이고, "이것과 저것이 어떻게 연결되는지"를
여러 단계 거쳐 추론해야 하면(멀티홉) Graph DB(GraphRAG)를 더하는 게 맞다. 많은 실무
구조는 "기본은 Vector, 필요한 영역만 Graph로 보강"하는 하이브리드다.

## 비유 한 줄

Vector DB는 "비슷한 책을 책장에서 바로 찾아주는 사서"고, Graph DB는 "이 사람이 누구랑
같이 일했고 그 사람이 또 누구 밑에서 배웠는지"를 선으로 따라가며 답해주는 족보 전문가다.

## 개념 표

| 항목 | Vector DB | Graph DB(GraphRAG) |
|---|---|---|
| 저장 단위 | 텍스트 임베딩(좌표) | 노드(개체) + 엣지(관계) |
| 잘하는 질문 | "이거랑 비슷한 내용 찾아줘" | "A와 B가 어떻게 연결돼 있어?" (멀티홉) |
| 속도 | 수 ms~수십 ms, 빠름 | 깊은 탐색일수록 느려짐(수십~수백 ms) |
| 구축 난이도 | 임베딩만 하면 됨, 낮음 | 개체·관계 스키마 설계 필요, 높음 |
| 설명 가능성 | 낮음(왜 뽑혔는지 불투명) | 높음(관계 경로를 보여줄 수 있음) |
| 대표 상황 | 일반 문서 Q&A, 빠른 PoC | 공급망, 금융, 의료처럼 관계·근거 추적이 중요한 도메인 |

## 구조 다이어그램

```
[단순 유사도 질문]                    [관계·멀티홉 질문]
"이 에러랑 비슷한 사례는?"             "이 모듈을 수정하면 어떤
      ↓                                팀의 어떤 서비스까지 영향 가나?"
[Vector DB]                                  ↓
  임베딩 유사도로 top-K 검색            [Graph DB]
      ↓                                  노드(모듈/팀/서비스) +
   [LLM 답변]                            엣지(의존·소유 관계) 다단 탐색
                                              ↓
                                         [LLM 답변 + 근거 경로]
```

## 동작 원리 (왜?)

| 질문 | 답 |
|---|---|
| 왜 Vector만으론 멀티홉이 약한가? | 벡터 유사도는 "의미가 비슷한 조각"을 찾을 뿐, "A 문서와 B 문서가 어떤 관계인지"는 모른다. 질문이 여러 단계(A→B→C)를 거쳐야 답이 나오면 유사도 한 번으로는 그 경로를 못 찾는다 |
| 왜 Graph는 설명 가능한가? | 관계가 명시적인 엣지로 저장돼 있어서, 답을 낼 때 "어떤 경로를 거쳐 이 결론에 도달했는지" 그래프 탐색 경로 자체를 근거로 보여줄 수 있다 |
| 왜 처음부터 Graph로 안 가나? | 스키마(어떤 개체·관계를 모델링할지) 설계 비용이 크고, 데이터가 바뀔 때마다 관계도 유지보수해야 한다 — 그래서 "우선 Vector로 시작, 멀티홉·설명가능성이 병목이 될 때 Graph 추가"가 일반적인 순서다 |

## 최소 예시

```
질문: "이 라이브러리를 업그레이드하면 뭐가 깨지나?"

Vector DB 접근: 업그레이드 가이드 문서 중 유사한 문단을 찾아 보여줌
 → "breaking change 항목" 텍스트는 찾지만, 내 프로젝트의 실제 의존 구조는 모름

Graph DB 접근: [내 모듈] --depends_on--> [이 라이브러리] --used_by--> [다른 모듈 3개]
 → 그래프를 따라가 "실제로 영향받는 모듈 목록"까지 답변 가능
```

## 요약 표

| 항목 | 내용 |
|---|---|
| 기본값 | Vector DB — 빠르고 구축이 쉬움, 대부분의 문서 Q&A에 충분 |
| Graph 추가 시점 | 멀티홉 추론, 개체 간 관계 질문, 금융/의료처럼 설명가능성이 필수인 도메인 |
| 흔한 선택 | 둘을 섞는 하이브리드(기본 Vector + 핵심 엔티티만 Graph) |
| 트레이드오프 | Graph는 정확도·설명력을 얻는 대신 구축 비용과 지연시간을 더 쓴다 |
| 다음에 해볼 것 | 내 프로젝트 질문 유형을 "단순 유사도" vs "관계 추론"으로 먼저 분류해보기 |

Sources:
- [Vector Databases vs. Graph RAG for Agent Memory](https://machinelearningmastery.com/vector-databases-vs-graph-rag-for-agent-memory-when-to-use-which/)
- [Couchbase — Graph RAG vs Vector RAG](https://www.couchbase.com/blog/graph-rag-vs-vector-rag/)
- [Instaclustr — Graph RAG vs Vector RAG](https://www.instaclustr.com/education/retrieval-augmented-generation/graph-rag-vs-vector-rag-3-differences-pros-and-cons-and-how-to-choose/)
