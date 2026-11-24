# AI 검토 우편함

Claude 가 `ai-review/request.md` 에 질문을 적어 `claude/...` 브랜치에 올리면,
GitHub Actions(`.github/workflows/ask-ai.yml`)가 제미나이에게 묻고
답을 `ai-review/response.md` 에 올립니다. 사람이 옮길 필요가 없습니다.

- 키는 저장소 Settings → Secrets and variables → Actions 에 `GEMINI_API_KEY` 로 저장 (채팅에 붙이지 않음).
- `to: openai` 로 적으면 OpenAI 로 보냄 (`OPENAI_API_KEY` 필요, 쓰는 만큼 요금).
- 제미나이·챗GPT 는 의견만, 수정은 Claude 가 합니다.
