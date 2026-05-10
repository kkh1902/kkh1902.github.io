---
title: 첫 발행 테스트 — Hello Notion
date: '2026-04-30'
categories:
- PUBLISH
- Notion
tags:
- test
- notion
vault_synced: true
---

# 첫 발행 테스트

이 노트는 Obsidian → Notion 자동 발행이 잘 되는지 확인하는 테스트 노트입니다.

## 체크 항목

- 페이지가 부모 페이지(Obsidian) 아래에 자식으로 생성되는가
- 제목이 제대로 들어가는가
- 본문 텍스트가 살아있는가
- 코드 블록 변환이 되는가
- 댓글이 달리는가

## 코드 블록 테스트

```python
def hello():
    print("Notion 발행 성공!")

hello()
```

## 다음 할 일

1. 발행 결과 확인
2. 다른 노트도 `status: published` 로 바꿔서 테스트
3. GitHub Actions 자동 발행 추가 (선택)

> 이 노트가 Notion에 보이면 파이프라인 정상 동작.

