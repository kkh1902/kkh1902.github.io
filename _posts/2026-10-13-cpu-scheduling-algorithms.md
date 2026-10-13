---
title: "CPU 스케줄링 알고리즘, 줄은 어떻게 세울까"
date: '2026-10-13 11:20:00 +0900'
categories:
- CS
tags:
- 운영체제
- CPU스케줄링
- 알고리즘
---

![CPU 스케줄링 알고리즘 비유 이미지](/assets/img/posts/cpu-scheduling-algorithms/header.png)

## TL;DR

CPU 스케줄링은 "은행 창구 대기열 운영 방식"을 정하는 문제다. 먼저 온 순서대로 받을지,
일 빨리 끝나는 손님부터 받을지, 번갈아가며 조금씩 처리해줄지에 따라 평균 대기시간과
공평성이 완전히 달라진다.

## 비유 한 줄

CPU = 창구 1개, 프로세스 = 대기 손님, 스케줄링 알고리즘 = "다음 손님을 누구로 부를지"
정하는 창구 운영 규칙.

## 개념 표

| 알고리즘 | 비유 | 한줄 설명 |
|---|---|---|
| FCFS(First Come First Served) | 선착순 한 줄 서기 | 도착 순서대로 처리, 비선점형 — 앞사람이 오래 걸리면 뒷사람이 손해(Convoy Effect) |
| SJF(Shortest Job First) | "볼일 짧은 손님 먼저" | 실행 시간이 짧은 작업 우선, 평균 대기시간 이론상 최소지만 긴 작업은 영원히 밀릴 수 있음(기아) |
| SRTF(Shortest Remaining Time First) | 중간에도 더 급한 손님 끼워주기 | SJF의 선점형 버전, 새 작업이 더 짧으면 즉시 교체 |
| Priority Scheduling | VIP 우선 창구 | 우선순위 높은 프로세스부터, 낮은 순위는 Aging으로 기아 방지 |
| Round Robin | 번갈아 n분씩 처리 | 타임 퀀텀만큼만 실행 후 큐 맨 뒤로, 공평하지만 퀀텀이 작으면 오버헤드 증가 |
| Multilevel Queue | 손님 등급별 창구 분리 | 포그라운드/백그라운드 등 큐 자체를 나눠 서로 다른 알고리즘 적용 |
| Multilevel Feedback Queue | 등급을 상황 봐가며 조정 | 오래 기다리거나 CPU를 오래 쓰면 큐를 이동 — 가장 유연하지만 가장 복잡 |

## 구조 다이어그램

```
FCFS 타임라인 (도착순 A, B, C / 실행시간 5, 1, 1)
[   A(5)   ][B(1)][C(1)]    ← B, C는 A 때문에 대기만 5초 (Convoy Effect)

Round Robin 타임라인 (퀀텀 2)
[A2][B1][C1][A2][A1]        ← 모두 빠르게 한 번씩 받음, 체감 대기시간 균등

Multilevel Feedback Queue
[Queue0: 퀀텀2(신규 프로세스)]
        │ 퀀텀 다 쓰면 강등
        ▼
[Queue1: 퀀텀4]
        │ 또 다 쓰면 강등
        ▼
[Queue2: FCFS(장기 실행 프로세스)]
```

## 동작 원리 (왜?)

| 질문 | 답 |
|---|---|
| 왜 FCFS는 평균 대기시간이 안 좋은가? | 실행시간이 긴 작업이 먼저 오면 뒤에 짧은 작업들이 전부 그 뒤에서 기다려야 함(Convoy Effect) |
| 왜 SJF는 현실에서 그대로 못 쓰나? | 프로세스의 실행시간을 "미리" 알아야 하는데 실제로는 예측값(지수 평균 등)에 의존하고, 짧은 작업이 계속 들어오면 긴 작업은 기아 상태에 빠짐 |
| 왜 Round Robin엔 타임 퀀텀 크기가 중요한가? | 퀀텀이 너무 작으면 컨텍스트 스위칭 오버헤드가 실제 작업시간을 압도하고, 너무 크면 사실상 FCFS와 같아짐 |
| 왜 우선순위 스케줄링에 Aging을 넣나? | 낮은 우선순위 프로세스가 계속 밀려 영원히 실행 안 되는 기아(Starvation)를 막기 위해, 기다린 시간만큼 우선순위를 서서히 올림 |

## 예시

```python
# Round Robin 간단 시뮬레이션 (퀀텀=2)
from collections import deque

procs = deque([["A", 5], ["B", 1], ["C", 1]])  # [이름, 남은 실행시간]
quantum = 2
timeline = []

while procs:
    name, remain = procs.popleft()
    run = min(quantum, remain)
    timeline.append(f"{name}{run}")
    remain -= run
    if remain > 0:
        procs.append([name, remain])  # 못 끝냈으면 큐 맨 뒤로

print(" -> ".join(timeline))
# A2 -> B1 -> C1 -> A2 -> A1
```

## 요약 표

| 알고리즘 | 선점형 | 핵심 장점 | 핵심 단점 |
|---|---|---|---|
| FCFS | X | 구현 단순 | Convoy Effect, 평균 대기시간 나쁨 |
| SJF | X | 평균 대기시간 이론상 최소 | 실행시간 예측 필요, 긴 작업 기아 |
| SRTF | O | SJF보다 반응성 좋음 | 컨텍스트 스위칭 잦음 |
| Priority | 둘 다 가능 | 중요한 작업 우선 처리 | Aging 없으면 기아 발생 |
| Round Robin | O | 공평한 응답시간 | 퀀텀 튜닝 필요 |
| Multilevel Feedback Queue | O | 가장 유연, 실제 OS에서 많이 채택 | 설계·튜닝 복잡 |
