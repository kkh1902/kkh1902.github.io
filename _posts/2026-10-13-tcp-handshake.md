---
title: "TCP 3-way handshake와 4-way handshake"
date: '2026-10-13 10:15:00 +0900'
categories:
- CS
tags:
- 네트워크
- TCP
---

![TCP 핸드셰이크 비유 이미지](/assets/img/posts/tcp-handshake/header.png)

## TL;DR

TCP는 데이터를 주고받기 전에 "서로 통화 가능한지 3번 확인"하고(3-way handshake), 끝낼 때는
"양쪽 다 할 말 끝났는지 4번 확인"한다(4-way handshake). 연결은 빠르게 3단계, 종료는 양쪽이
각자 독립적으로 끝내야 해서 4단계다.

## 비유 한 줄

전화 통화 시작은 "여보세요?(SYN) → 네 들려요(SYN-ACK) → 네 말씀하세요(ACK)" 3마디면
되지만, 끝낼 때는 "저 이제 끊을게요(FIN) → 네 알겠어요(ACK) → (마저 할 말 하고) 저도
끝났어요(FIN) → 네 끊을게요(ACK)"처럼 양쪽이 따로 마무리해야 해서 4마디가 필요하다.

## 개념 표

| 용어 | 비유 | 한줄 설명 |
|---|---|---|
| SYN | "여보세요?" | 연결 요청, 내 시작 시퀀스 번호(x) 전달 |
| SYN-ACK | "네 들려요, 저도 시작할게요" | 요청 수락(ACK=x+1) + 서버도 자기 시퀀스 번호(y) 전달 |
| ACK | "네 말씀하세요" | 서버 시퀀스 확인(ACK=y+1), 연결 확립 |
| FIN | "저 끊을게요" | 연결 종료 요청 |
| CLOSE_WAIT | "잠깐만요, 마저 할 말이" | FIN을 받았지만 아직 보낼 데이터가 남은 상태 |
| TIME_WAIT | "혹시 몰라 수화기 잠깐 더 들고 있기" | 마지막 ACK 유실 대비 + 지연 패킷이 새 연결과 섞이지 않게 대기 |

## 구조 다이어그램

```
[연결: 3-way handshake]           [종료: 4-way handshake]
Client        Server              Client        Server
  |--- SYN(x) --->|                 |--- FIN ----->|
  |<-SYN-ACK(y)---|                 |<--- ACK ------|  (CLOSE_WAIT 진입)
  |--- ACK ------>|                 |   (남은 데이터 전송)
  연결 확립                          |<--- FIN ------|
                                    |--- ACK ----->|
                                  TIME_WAIT 진입    소켓 닫힘
```

## 동작 원리 (왜?)

| 질문 | 답 |
|---|---|
| 왜 연결은 3번이면 끝나는데 종료는 4번인가? | 연결은 "양방향 동시 준비"만 확인하면 되지만, 종료는 TCP가 전이중(양방향 독립 전송)이라 클라이언트가 할 말을 끝내도 서버는 아직 보낼 데이터가 남아있을 수 있어서 따로 끝내야 함 |
| 왜 2번이 아니라 3번인가? | SYN-ACK을 한 번에 보내긴 하지만, "서버가 받았다는 확인(ACK)"을 클라이언트도 받아야 양쪽 다 상대가 준비됐다는 걸 알 수 있음 — 2번으로는 서버가 클라이언트의 수신 여부를 확신 못 함 |
| 왜 TIME_WAIT이 필요한가? | 마지막 ACK가 유실되면 서버가 FIN을 재전송하는데, 클라이언트가 이미 소켓을 닫아버리면 응답을 못 해 서버가 영원히 대기할 수 있음. 또 같은 포트로 새 연결이 바로 생기면 이전 연결의 지연 패킷과 혼동될 수 있어 일정 시간 대기함 |

## 예시

```python
import socket

# 3-way handshake는 connect() 호출 한 줄에 전부 들어있다
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("example.com", 80))  # 내부적으로 SYN -> SYN-ACK -> ACK 수행됨
s.send(b"GET / HTTP/1.1\r\nHost: example.com\r\n\r\n")
print(s.recv(100))
s.close()  # 4-way handshake 시작 (FIN -> ACK -> FIN -> ACK)
```

## 요약 표

| 단계 | 횟수 | 핵심 목적 |
|---|---|---|
| 연결(3-way) | SYN → SYN-ACK → ACK | 양쪽이 서로 준비됐음을 확인 |
| 종료(4-way) | FIN → ACK → FIN → ACK | 양쪽이 각자 독립적으로 전송 종료를 확정 |
| TIME_WAIT | 종료 후 일정 시간 대기 | 마지막 ACK 유실 대비, 지연 패킷 혼동 방지 |
