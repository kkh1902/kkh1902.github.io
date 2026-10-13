---
title: "이진 탐색, 경계 조건으로 다시 정리하기"
description: "이진 탐색을 짤 때마다 헷갈리는 경계값(lo, hi, 종료 조건)을 한 번에 정리한다."
pubDate: 2026-10-13
category: cs
subcategory: algorithm
tags: ["알고리즘", "탐색"]
---

## 왜 매번 헷갈릴까

이진 탐색 자체는 단순하다. 그런데 막상 코드를 짤 때마다 `lo <= hi`인지
`lo < hi`인지, `mid`를 찾았을 때 `hi = mid`인지 `hi = mid - 1`인지가
헷갈린다. 원인은 "무엇을 찾는 이진 탐색인지"를 먼저 정하지 않고 코드부터
쓰기 때문이다.

## 두 가지 형태로 나눠서 외운다

**1) 정확히 일치하는 값을 찾을 때**

```python
lo, hi = 0, len(arr) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
return -1  # 못 찾음
```

- 탐색 구간을 `[lo, hi]` 닫힌 구간으로 본다.
- 종료 조건은 `lo > hi`, 즉 구간이 비었을 때.

**2) 조건을 만족하는 경계(첫 번째/마지막 위치)를 찾을 때**

```python
lo, hi = 0, len(arr)
while lo < hi:
    mid = (lo + hi) // 2
    if condition(arr[mid]):
        hi = mid
    else:
        lo = mid + 1
return lo  # condition을 만족하는 첫 인덱스
```

- 탐색 구간을 `[lo, hi)` 반열린 구간으로 본다.
- `hi`를 배열 길이로 시작해도 안전하다 — 범위 밖 인덱스를 참조하지 않는다.
- "가장 왼쪽 경계"를 찾는 패턴이라 이분 매개변수 탐색(parametric search)에
  그대로 쓸 수 있다.

## 정리

이진 탐색을 짜기 전에 "정확히 하나를 찾는가, 경계를 찾는가"부터 정하면
구간을 닫힌 구간으로 둘지 반열린 구간으로 둘지가 자동으로 결정된다. 그
다음부터는 템플릿을 그대로 꽂아 쓰면 된다.
