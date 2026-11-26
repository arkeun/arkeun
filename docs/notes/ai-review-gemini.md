---
name: ai-review-gemini
description: 제미나이/OpenAI 자동 의견 받기 방법 — arkeun/arkeun 의 ask-ai 워크플로 (2026-11-24)
metadata:
  type: reference
  modified: 2026-11-24T12:56:16.699Z
---
- 이 클라우드 환경에서는 generativelanguage.googleapis.com 직접 접속이 막혀 있음(403). 그래서 GitHub Actions 경유로 만듦.
- arkeun/arkeun main 에 추가(11/24): `.github/workflows/ask-ai.yml`, `.github/scripts/ask_ai.py`, `.github/scripts/ask.sh`, `ai-review/README.md`.
- 쓰는 법: claude/ 브랜치에서 질문 파일 작성(설정 줄 `to: gemini`, `file: index.html` 또는 png 스크린샷 여러 줄, `---` 아래 질문) → `.github/scripts/ask.sh 질문.md` → 답이 ai-review/response.md 로 옴(1~2분, 최대 10분 대기).
- 키: 저장소 Secrets `GEMINI_API_KEY` (에릭이 직접 넣음, 채팅 금지). `to: openai` 는 `OPENAI_API_KEY` 필요 — 기존 키는 Codex 에서 401(틀림)이었고 OpenAI 는 쓰는 만큼 요금.
- 11/24 시험 결과: 제미나이 무료 키로 실제 되는 건 gemini-flash-lite-latest 뿐(flash·pro는 429 한도, 2.5는 신규 사용자 404). index.html 은 CSS 빼고 보내면 통째로 들어감(코드+스크린샷 같이 보내야 기능까지 이해 — 에릭 지적: 사진만으론 기능 모름). 제미나이 의견은 코드 근거가 틀린 것도 있어 반영 전 확인 필요. 결과 예: /mnt/project-files/boardgame-app/gemini-review-1.md
- OpenAI: 키는 이제 맞지만 크레딧 0(credit_balance_exhausted) → 에릭이 충전해야 씀.
- 에릭(11/24): 의논은 묻기→코드로 확인·반박→합의한 것만 수정→다시 확인. 모든 오간 내용은 arkeun/arkeun AI_TALK.md 에 쉬운 한국어로. PR 은 Gemini Code Assist 앱이 자동 리뷰(/gemini review). 수정 보고 때는 사진 말고 사이트 링크(끝에 ?v=매번 다른 숫자, 폰 캐시 방지)+눌러 볼 순서. UI/UX 비교는 가능하면 한국 앱(비트윈·썸원·당근 모임·소모임·문토·카카오톡·토스·왓챠피디아·오늘의집).
- 로컬 스크린샷: CDN 막힘 → npm 으로 react/react-dom/htm 받아 playwright route 로 대체.
- 모델(11/24 밤 기준): 무료 키로 잘 되는 건 gemini-3-flash-preview(목록 2번째). flash-lite 는 자주 503 붐빔, flash(3.8)는 하루 20회. ask_ai.py 가 순서대로 시도. 같은 브랜치에 질문 두 개 연달아 보낼 땐 앞 답이 온 뒤에.
- Gemini Code Assist GitHub 앱: 설치했다지만 11/24 PR #9·#10에 반응 없음(설정 확인 요청함). 그래서 PR 은 만들고 Claude가 바로 병합 중.
- 역할: 제미나이·챗GPT 는 의견만, 수정은 Claude. 검토 때마다 제미나이 의견도 받아 다른 검토 AI와 같이 논의.
관련: [[boardgame-app-github]]
- 11/25: PR #13(팝업 대신 페이지: pushStack 라우트 'd:날짜','p:이름','pg:게임:이름','x:확장', Page 컴포넌트), #14·#15(사람 심리 문구, 아깝게 진 판 한 줄) 병합. 문구 전체 목록 /mnt/project-files/boardgame-app/app-words.md. 의논 기록 AI_TALK ⑦⑧. 푸시는 claude/project-thread-c5mner 브랜치만 됨(새 브랜치 이름은 거부됨).
