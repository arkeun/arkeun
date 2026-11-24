# AI 검토 우편함

Claude 가 `ai-review/request.md` 에 질문을 적어 `claude/...` 브랜치에 올리면,
GitHub Actions(`.github/workflows/ask-ai.yml`)가 제미나이에게 묻고
답을 `ai-review/response.md` 에 올립니다. 사람이 옮길 필요가 없습니다.

- 키는 저장소 Settings → Secrets and variables → Actions 에 `GEMINI_API_KEY` 로 저장 (채팅에 붙이지 않음).
- `to: openai` 로 적으면 OpenAI 로 보냄 (`OPENAI_API_KEY` 필요, 쓰는 만큼 요금).
- 제미나이·챗GPT 는 의견만, 수정은 Claude 가 합니다.

## PR 자동 검토
- PR 검토는 GitHub 에 설치한 **Gemini Code Assist** 앱이 맡아요 (무료). PR 을 열면 자동으로 리뷰를 달고, 댓글에 `/gemini review` 라고 적으면 다시 해요.
- 이 폴더의 우편함(ask-ai)은 Claude 가 초안 전체·화면 사진을 보여 주며 따로 물을 때 씁니다.
- Codex(OpenAI) 자동 리뷰는 잔액 0원이라 멈춰 둠. 충전 후 Settings → Secrets and variables → Actions → Variables 에 `CODEX_ENABLED` = `true`.
