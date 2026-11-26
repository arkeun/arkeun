---
name: boardgame-data-sources
description: 보드게임 앱 기본 데이터 소스 조사 결과(BGG API 약관, 한국어 이름, 샘플 CSV 위치)
metadata:
  type: project
  modified: 2026-11-22T02:58:48.562Z
---

앱개발 프로젝트 = 보드게임 플레이 기록(누구랑/언제) + 리뷰 작성·공유 앱. 리뷰는 게임 데이터에 달림.

- 게임 기준 키: BGG ID로 하기로 제안(2026-11-22).
- BGG XML API: 2025-11부터 앱 등록 후 인증 토큰 필수, 비상업 용도만 무료, 데이터 수정 금지, "Powered by BGG" 로고 필수, AI 학습 금지. 상업 조건은 미확인.
- Wikidata는 CC0이지만 게임 수 적음. 한국어 이름은 체계적 공개 소스 없음 → 수기 정리 + 사용자 제안.
- 클라우드 세션에선 BGG/Wikidata 접속이 프록시에 막힘(2026-11-22 기준).
- 샘플: /mnt/project-files/boardgame-data/sample_boardgames_v1.csv (51개, 기억 기반, 미검증)
- 보고서 Claude Doc: https://claude.ai/artifact/DcNccrdpCY1esBUyT7udfS
