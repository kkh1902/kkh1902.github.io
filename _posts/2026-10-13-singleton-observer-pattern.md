---
title: "싱글톤 패턴과 옵저버 패턴"
date: '2026-10-13 13:00:00 +0900'
categories:
- CS
tags:
- 디자인패턴
---

![싱글톤 옵저버 패턴 비유 이미지](/assets/img/posts/singleton-observer-pattern/header.png)

## TL;DR

싱글톤은 "사무실에 사장은 한 명뿐"이라는 규칙이고, 옵저버는 "공지사항을 구독한
사람에게만 알림이 자동으로 가는 구조"다. 둘 다 객체 간 관계를 "하나만 존재" 또는
"상태 변화를 자동 전파"로 깔끔하게 정리하는 생성/행동 디자인 패턴이다.

## 비유 한 줄

싱글톤 = 회사에 사장실은 하나뿐이라 누가 들어가도 같은 사장을 만남.
옵저버 = 유튜브 채널을 구독하면, 새 영상이 올라올 때마다 구독자 모두에게 알림이 감
(채널은 구독자 목록을 몰라도 그냥 "새 영상 올렸다"고만 외치면 됨).

## 개념 표

| 패턴 | 비유 | 핵심 동작 | 대표 용도 |
|---|---|---|---|
| 싱글톤(Singleton) | 사무실에 사장은 한 명 | 클래스의 인스턴스를 전역에서 단 1개만 생성·공유 | DB 커넥션 풀, 설정(Config) 객체, 로거 |
| 옵저버(Observer) | 유튜브 구독 알림 | 주체(Subject)의 상태가 바뀌면 등록된 관찰자(Observer)들에게 자동 통지 | 이벤트 시스템, MVC의 View 업데이트, pub/sub |

## 구조 다이어그램

```
[싱글톤]
   getInstance() 호출1 ─┐
   getInstance() 호출2 ─┼─→ 같은 단 하나의 인스턴스 반환
   getInstance() 호출3 ─┘

[옵저버]
   Subject(채널) --상태 변경 발생--> notify()
        │
        ├──→ Observer A (알림 수신)
        ├──→ Observer B (알림 수신)
        └──→ Observer C (알림 수신)
   * Subject는 Observer 목록만 들고 있고, 각 Observer의 구체적 동작은 모름(느슨한 결합)
```

## 동작 원리(왜?)

| 질문 | 답 |
|---|---|
| 싱글톤은 왜 멀티스레드 환경에서 조심해야 하나? | 두 스레드가 동시에 `getInstance()`를 처음 호출하면 인스턴스가 2개 생길 수 있음(race condition) — `synchronized`나 언어별 락, 또는 클래스 로딩 시점에 미리 생성(eager initialization)으로 방지 |
| 싱글톤이 "안티패턴"이라고 비판받는 이유는? | 전역 상태를 만들어 테스트하기 어렵고(목(mock) 교체가 까다로움), 숨겨진 의존성을 만들어 모듈 간 결합도를 높임 — 꼭 필요한 경우(설정, 로그)로 제한해서 써야 함 |
| 옵저버 패턴이 느슨한 결합(Loose Coupling)을 만드는 이유는? | Subject는 Observer의 인터페이스(예: `update()`)만 알고 구체 클래스는 모름 — 새 Observer를 추가해도 Subject 코드를 안 고쳐도 됨(개방-폐쇄 원칙과 직결) |
| 실무에서 옵저버 패턴은 어디 숨어있나? | JavaScript의 이벤트 리스너(`addEventListener`), React의 상태 변경 → 리렌더링, Redis Pub/Sub, Spring의 `ApplicationEvent` 전부 옵저버 패턴의 변형 |

## 예시

```python
# 싱글톤
class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

a, b = Config(), Config()
print(a is b)  # True — 같은 인스턴스

# 옵저버
class Channel:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, observer):
        self._subscribers.append(observer)

    def upload_video(self, title):
        for sub in self._subscribers:
            sub.notify(title)

class Subscriber:
    def __init__(self, name):
        self.name = name

    def notify(self, title):
        print(f"{self.name}: 새 영상 '{title}' 알림 받음")

channel = Channel()
channel.subscribe(Subscriber("철수"))
channel.subscribe(Subscriber("영희"))
channel.upload_video("DFS vs BFS 정리")
# 철수: 새 영상 'DFS vs BFS 정리' 알림 받음
# 영희: 새 영상 'DFS vs BFS 정리' 알림 받음
```

## 요약 표

| 패턴 | 쓸 때 | 주의할 때 |
|---|---|---|
| 싱글톤 | 전역에서 공유해야 할 자원(설정, 커넥션 풀)이 딱 하나여야 할 때 | 테스트 어려움·숨은 의존성 — 남용 금지 |
| 옵저버 | 상태 변화를 여러 곳에 자동으로 전파해야 할 때 | 구독자가 많아지면 통지 순서/성능 고려 필요 |

다음에 볼 것: 패턴을 포함한 좋은 객체지향 설계의 다섯 원칙 [SOLID](/posts/solid-principles/).
