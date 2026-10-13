---
title: "SOLID 원칙 정리"
date: '2026-10-13 14:00:00 +0900'
categories:
- CS
tags:
- 디자인패턴
- 객체지향
---

![SOLID 원칙 비유 이미지](/assets/img/posts/solid-principles/header.png)

## TL;DR

SOLID는 "코드를 고칠 때 최소한의 범위만 건드리게 하는" 다섯 가지 설계 원칙이다.
한 가지로 요약하면 **"변경에는 열려 있고, 그 변경 때문에 다른 코드가 깨지는 일은
최소화하자"**다. 패턴(싱글톤·옵저버 등)은 이 원칙을 실제 코드로 구현하는 방법들이고,
SOLID는 그 설계의 기준점이다.

## 비유 한 줄

레고 블록처럼 부품 하나를 교체해도 전체 구조물이 안 무너지게 설계하는 것 — 블록
하나(클래스 하나)는 역할이 분명하고(S), 새 블록을 끼울 땐 기존 블록을 안 깎아도 되고(O),
같은 규격 블록끼리는 서로 바꿔 끼워도 안 깨지고(L), 필요 없는 홈까지 억지로 안 뚫려
있고(I), 블록끼리 직접 안 붙고 커넥터(추상화)를 거쳐 연결된다(D).

## 개념 표

| 원칙 | 영문 | 비유 | 한줄 설명 |
|---|---|---|---|
| S | Single Responsibility Principle | 직원 한 명에게 역할 하나 | 클래스는 변경 이유가 단 하나여야 함 |
| O | Open/Closed Principle | 콘센트는 새 플러그를 꽂을 수 있지만 벽 공사는 안 함 | 확장엔 열려 있고, 기존 코드 수정엔 닫혀 있어야 함 |
| L | Liskov Substitution Principle | 아들 대신 아버지 차를 몰아도 운전 방식은 같아야 함 | 자식 클래스는 부모 클래스를 대체해도 프로그램이 깨지지 않아야 함 |
| I | Interface Segregation Principle | 다용도 리모컨보다 기능별 전용 리모컨 | 클라이언트가 쓰지도 않을 메서드에 의존하게 만들지 말 것 |
| D | Dependency Inversion Principle | 전등을 직접 납땜하지 않고 콘센트(규격)로 연결 | 상위 모듈이 하위 모듈의 구체 구현이 아니라 추상화(인터페이스)에 의존해야 함 |

## 구조 다이어그램

```
[위반: 구체 클래스에 직접 의존]        [준수: 추상화에 의존(DIP)]
  OrderService                          OrderService
       │                                     │
       ▼                                     ▼
  MySQLDatabase (구체)                  Database (인터페이스)
  — DB를 바꾸려면 OrderService 수정        ↑           ↑
                                     MySQLDatabase  MongoDatabase
                                     — 구현체 교체만 하면 됨, OrderService는 안 바뀜
```

## 동작 원리(왜?)

| 질문 | 답 |
|---|---|
| 왜 SRP(단일 책임)를 어기면 문제가 되나? | 한 클래스가 여러 책임(예: 데이터 검증 + DB 저장 + 이메일 발송)을 가지면, 이메일 로직 하나 바꾸려 해도 전체 클래스를 건드려야 하고 다른 책임까지 망가뜨릴 위험이 커짐 |
| OCP가 실제로 지켜지는 예시는? | 전략 패턴(Strategy Pattern) — 새로운 할인 정책을 추가할 때 기존 `DiscountPolicy` 인터페이스 구현체만 하나 더 만들면 되고, 가격 계산 로직(기존 코드)은 안 건드림 |
| LSP를 어기는 흔한 사례는? | "정사각형은 직사각형이다"를 상속으로 구현하면, 직사각형의 `setWidth`가 정사각형에선 높이까지 바꿔버려 부모 타입의 기대(너비만 바뀜)를 깨뜨림 — 상속 관계가 논리적으로 맞아도 행동 계약이 깨지면 LSP 위반 |
| ISP와 SRP는 뭐가 다른가? | SRP는 "클래스"의 책임을 하나로 제한하는 것이고, ISP는 "인터페이스"를 작게 쪼개 클라이언트가 필요한 메서드만 보게 하는 것 — 관점이 클래스 vs 인터페이스로 다름 |
| DIP와 OCP는 왜 세트로 다니나? | 상위 모듈이 추상화에 의존해야(DIP) 새 구현체를 추가할 때 기존 코드 수정 없이 확장(OCP)할 수 있음 — DIP는 OCP를 가능하게 하는 구조적 전제조건 |

## 예시

```python
from abc import ABC, abstractmethod

# DIP + OCP: 추상화(인터페이스)에 의존, 새 결제수단 추가 시 기존 코드 무변경
class PaymentMethod(ABC):
    @abstractmethod
    def pay(self, amount: int) -> None: ...

class CreditCard(PaymentMethod):
    def pay(self, amount):
        print(f"신용카드로 {amount}원 결제")

class KakaoPay(PaymentMethod):
    def pay(self, amount):
        print(f"카카오페이로 {amount}원 결제")

class OrderService:
    def __init__(self, payment: PaymentMethod):
        self.payment = payment  # 구체 클래스가 아니라 추상화에 의존

    def checkout(self, amount):
        self.payment.pay(amount)

OrderService(KakaoPay()).checkout(15000)  # 카카오페이로 15000원 결제
OrderService(CreditCard()).checkout(9900)  # 신용카드로 9900원 결제
```

## 요약 표

| 원칙 | 한 문장 요약 | 어길 때 생기는 증상 |
|---|---|---|
| SRP | 클래스는 변경 이유 하나만 | 작은 수정에도 전체 테스트가 깨짐 |
| OCP | 확장엔 열고 수정엔 닫기 | 기능 추가마다 기존 코드를 계속 고쳐야 함 |
| LSP | 자식은 부모 자리를 완전히 대체 가능해야 함 | 다형성 코드에서 타입 체크 분기가 늘어남 |
| ISP | 인터페이스는 필요한 만큼만 작게 | 안 쓰는 메서드까지 구현해야 함 |
| DIP | 구체 구현이 아닌 추상화에 의존 | 모듈 하나 바꾸면 연쇄적으로 다 고쳐야 함 |

지금까지 정렬→탐색→그래프→DP→디자인패턴→SOLID로 이어지는 CS 기초 시리즈를
다뤘다. 다음은 자료구조·운영체제·네트워크 심화로 이어갈 예정.
