---
title: "트랜잭션(Transaction)과 격리 수준(Isolation Level)"
date: '2026-10-13 11:30:00 +0900'
categories:
- CS
tags:
- 데이터베이스
- 트랜잭션
---

![트랜잭션 계좌이체 비유 이미지](/assets/img/posts/transaction-isolation-level/header.png)

## TL;DR

트랜잭션은 "모 아니면 도"로 묶인 작업 단위다(계좌이체 중 반만 성공하면 돈이 증발하거나
복제된다). 격리 수준은 "동시에 여러 사람이 같은 데이터를 건드릴 때 서로 얼마나 못 보게
막을지"를 정하는 다이얼 — 엄격할수록 안전하지만 느려진다.

## 비유 한 줄

계좌이체는 "내 통장에서 빼기"와 "상대 통장에 더하기" 두 동작인데, 중간에 정전이 나서
빼기만 되고 더하기가 안 되면 돈이 사라진다 — 트랜잭션은 이 둘을 "둘 다 성공하거나 둘 다
안 한 것처럼 되돌리기"로 묶어준다.

## 개념 표

| 용어 | 비유 | 한줄 설명 |
|---|---|---|
| ACID | 트랜잭션의 4대 보증서 | 원자성(Atomicity)·일관성(Consistency)·고립성(Isolation)·지속성(Durability) |
| Dirty Read | 아직 확정 안 된 소문을 사실처럼 들음 | 다른 트랜잭션이 커밋 안 한 중간 값을 읽어버리는 문제 |
| Non-repeatable Read | 같은 질문을 두 번 했더니 답이 바뀜 | 같은 행을 두 번 읽었는데 그 사이 다른 트랜잭션이 값을 바꿔버림 |
| Phantom Read | 같은 조건으로 다시 조회했더니 행이 늘어남 | 같은 조건 쿼리를 두 번 했는데 그 사이 새 행이 추가/삭제됨 |
| READ UNCOMMITTED | 소문도 다 믿기 | 가장 느슨, Dirty Read까지 허용 |
| SERIALIZABLE | 한 명씩 줄 세워 처리 | 가장 엄격, 사실상 순차 실행처럼 동작 |

## 구조 다이어그램

```
격리 수준이 낮음 <-----------------------------------------> 격리 수준이 높음
READ UNCOMMITTED -> READ COMMITTED -> REPEATABLE READ -> SERIALIZABLE
(Dirty Read 가능)   (Dirty Read 차단)  (Non-repeatable    (Phantom Read까지
                                        Read 차단)          차단, 가장 느림)
```

## 동작 원리(왜?)

| 질문 | 답 |
|---|---|
| 왜 격리 수준을 올릴수록 느려지나? | 더 엄격하게 막으려면 잠금(lock)을 더 오래, 더 넓게 걸어야 해서 동시에 처리할 수 있는 트랜잭션 수가 줄어든다 |
| 실무 기본값은? | MySQL(InnoDB)은 REPEATABLE READ, PostgreSQL·Oracle은 READ COMMITTED가 기본값 — DB마다 다르다 |
| SERIALIZABLE을 안 쓰는 이유는? | 사실상 한 번에 하나씩 순서대로 처리하는 것과 비슷해져 동시성 이점이 거의 사라진다 — 꼭 필요한 구간에만 짧게 쓴다 |

## 예시

```sql
BEGIN;  -- 트랜잭션 시작
UPDATE accounts SET balance = balance - 10000 WHERE id = 'A'; -- 출금
UPDATE accounts SET balance = balance + 10000 WHERE id = 'B'; -- 입금
COMMIT; -- 둘 다 성공해야 확정, 중간에 실패하면 ROLLBACK으로 전부 취소
```

## 요약 표

| 격리 수준 | Dirty Read | Non-repeatable Read | Phantom Read |
|---|---|---|---|
| READ UNCOMMITTED | 발생 | 발생 | 발생 |
| READ COMMITTED | 차단 | 발생 | 발생 |
| REPEATABLE READ | 차단 | 차단 | 발생(DB별 차이 있음) |
| SERIALIZABLE | 차단 | 차단 | 차단 |
