---
name: boardgame-app-verify-on-phone
description: 보드게임 앱 초안은 보고 전에 390px 폰 폭 스크린샷으로 직접 확인할 것 (사용자 "이게 최선이야?" 피드백, 2026-11-23)
metadata:
  type: feedback
  modified: 2026-11-23T02:04:39.928Z
---
초안 v24를 "다 반영했어요"라고 보고했는데, 사용자가 폰에서 보고 "이게 최선이야?"라고 함. 실제로는 CSS 클래스 충돌(.stack, .picked 중복)로 캐릭터가 세로로 쌓이고 사람 칩이 잘렸음. 하루 기록 하나가 화면을 거의 다 차지해서 "쉽게 확인"도 안 됐음.
**Why:** AI 셋이 말로만 합의하고 아무도 실제 폰 폭으로 렌더링해 보지 않았음.
**How to apply:** 화면을 고칠 때마다 390px 폭에서 홈 첫 화면·스크롤 중·기록 시트·보관함 스크린샷을 찍어 /mnt/project-files/boardgame-app/shots/ 에 올리고, 확인한 뒤에 사용자에게 보고. 밀도 기준은 홈 하루 기록 약 150px(한 화면 4일). CSS 클래스 이름 중복은 grep으로 점검. 클라우드 세션에서는 아티팩트 CDN(cdnjs, jsdelivr)이 막혀 렌더링이 안 될 수 있음.
관련: [[boardgame-app-home-structure]] [[boardgame-app-visual-design]]
