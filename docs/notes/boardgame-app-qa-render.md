---
name: boardgame-app-qa-render
description: 클라우드에서 CDN이 막혀도 보드게임 초안을 폰 크기로 렌더링해 기능 점검하는 방법과 QA 진행 상태
metadata:
  type: reference
  modified: 2026-11-23T02:21:14.992Z
---
- 렌더링: Artifact read로 최신 HTML을 받고 scratchpad에 `npm i react@18.3.1 react-dom@18.3.1 htm@3.1.1` 설치. Playwright `page.route('**/*')`에서 cdnjs/jsdelivr URL 끝(react.production.min.js 등)을 node_modules/*/umd 파일로 fulfill, 나머지 외부 요청은 abort. 390×844, hasTouch.
- 기록 시트 셀렉터: `.sheet`, 게임 추가 버튼 aria-label "스플렌더 한 판 추가", 승자 aria-label "1판 에릭 승". 시트가 열려 있으면 탭바 클릭이 scrim에 막힘.
- QA 1~5회차(2026-11-23): 결과는 /mnt/project-files/boardgame-app/qa-report-1.md, 스크린샷 shots/qa1~qa5/. 5회차부터는 에릭님이 말 안 한 문제 10개 이상을 기준 번호(review-log.md 맨 위 7개)와 함께 찾는 방식. v37에서 16개 중 1번(같은 날 같은 게임 줄 합쳐짐) 고쳐짐, 나머지는 다음 판 대기.
- 기록 시트의 모임 고르기는 시스템 select(`.sheet select`), 날짜 약속·투표 입력칸은 시트가 아니라 #app 안에 바로 있음(placeholder: 어디서?, 후보 1…). 다운로드는 base.js에서 acceptDownloads:true로 받음.
관련: [[boardgame-app-verify-on-phone]]
