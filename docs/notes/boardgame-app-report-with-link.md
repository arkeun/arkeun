---
name: boardgame-app-report-with-link
description: 보드게임 앱 수정 보고는 스크린샷이 아니라 배포된 사이트 링크와 "어디를 눌러 뭘 해 보면 되는지" 순서로 (에릭 11/24)
metadata:
  type: feedback
  modified: 2026-11-24T13:26:54.450Z
---
2026-11-24 에릭: "수정할 때마다 나한테 수정본을 보내서 볼 수 있게… 사진으로 말고 기능적으로".
**Why:** 에릭은 사진이 아니라 실제로 눌러 보며 확인하고 싶어 함.
**How to apply:** main에 push → GitHub Pages 배포(Actions "Deploy static app to GitHub Pages") 성공 확인 → https://arkeun.github.io/arkeun/ 링크와 확인 순서(1. 닉네임 넣고 "예시로 먼저 둘러보기" 2. … 누르기)를 보냄. 스크린샷은 내부 확인용으로 계속 찍되 보고의 중심은 링크. 클라우드에서 arkeun.github.io는 프록시로 막혀 있어 배포 확인은 gh api actions/runs로.
관련: [[boardgame-app-github]] [[boardgame-app-verify-on-phone]]
- 11/24 에릭: "이렇게 물어보면 내가 다 고치는 거 아냐?" → 디자인 세부(달력 표시 방식 등)는 묻지 말고 검토 AI·제미나이와 정해서 고친 뒤 결과만 보고. 에릭이 이미 정한 걸 바꿀 때만 물어봄. 홈 달력 칸 = 누구랑(모임이면 모임명, 커플이면 상대+하트, 친구면 첫 이름+'외 N명', 혼자) — 에릭 11/24 결정, 게임 표지·이름 아님.
- 링크는 캐시 안 남게 매번 ?v=<커밋 앞 7자리> 붙여서 줄 것(에릭 11/24).
