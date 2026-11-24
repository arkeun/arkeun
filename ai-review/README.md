# AI 검토 우편함

Claude 가 `ai-review/request.md` 에 질문을 적어 `claude/...` 브랜치에 올리면,
GitHub Actions(`.github/workflows/ask-ai.yml`)가 제미나이에게 묻고
답을 `ai-review/response.md` 에 올립니다. 사람이 옮길 필요가 없습니다.

- 키는 저장소 Settings → Secrets and variables → Actions 에 `GEMINI_API_KEY` 로 저장 (채팅에 붙이지 않음).
- `to: openai` 로 적으면 OpenAI 로 보냄 (`OPENAI_API_KEY` 필요, 쓰는 만큼 요금).
- 제미나이·챗GPT 는 의견만, 수정은 Claude 가 합니다.

## PR 자동 검토 (`gemini-pr-review.yml`)
- PR 을 처음 열 때 한 번, 그리고 PR 댓글에 `/gemini` 라고 적을 때만 돕니다 (push 마다 돌지 않아 무료 한도를 아낌).
- `/gemini 커플 화면만 봐 줘` 처럼 뒤에 질문을 붙일 수 있어요. 결과는 PR 댓글로 달립니다.
- Codex(OpenAI) 자동 리뷰는 잔액 0원이라 멈춰 둠. 충전 후 Settings → Secrets and variables → Actions → Variables 에 `CODEX_ENABLED` = `true`.
