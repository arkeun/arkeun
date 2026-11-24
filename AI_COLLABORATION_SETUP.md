# AI 공동 개발 자동화

이 저장소에는 두 가지 자동화가 추가되어 있습니다.

## 1. Codex 자동 리뷰
- 같은 저장소에서 Pull Request가 열리거나 업데이트되면 실행됩니다.
- 변경 코드를 읽기 전용으로 검토하고, 결과를 PR 댓글로 남깁니다.
- 자동으로 코드를 수정하거나 병합하지 않습니다.

## 2. Claude 개발 파트너
- PR/이슈 댓글에 `@claude`를 포함하면 Claude Code Action이 실행됩니다.
- Claude는 CLAUDE_TO_CHATGPT.md와 프로젝트 지침을 참고합니다.
- 요청에 따라 코드 수정과 테스트를 수행하고 PR로 제안할 수 있습니다.

## 최초 1회 필요한 연결

GitHub 저장소 관리자 권한으로 다음 두 개의 Actions secret을 등록해야 합니다.

1. `OPENAI_API_KEY`: Codex GitHub Action용 OpenAI API 키
2. `ANTHROPIC_API_KEY`: Claude Code Action용 Anthropic API 키

경로: GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

Claude 공식 GitHub App도 이 저장소에 설치되어 있어야 합니다.
- Claude 설정 안내: https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md
- Codex GitHub Action 안내: https://learn.chatgpt.com/docs/github-action

## 비용과 한계
- ChatGPT 구독과 OpenAI API 사용료는 별도입니다. Codex Action은 API 키와 별도 API 과금이 필요합니다.
- Claude 구독과 Anthropic API 사용료도 별도일 수 있습니다. Claude Action은 API 키 또는 지원되는 OAuth 방식이 필요합니다.
- 두 자동화는 GitHub PR/댓글을 통해 협업하지만, 무한 자동 반복이나 자동 병합은 하지 않습니다.
- 자동 생성된 코드와 리뷰는 사람이 확인한 뒤 병합해야 합니다.
- 외부 기여자의 PR은 비밀키 보호를 위해 Codex 자동 리뷰 대상에서 제외합니다.

## 3. 제미나이(또는 OpenAI) 자동 의견 받기
- Claude 가 `claude/...` 브랜치에 `ai-review/request.md` 를 올리면 `ask-ai.yml` 이 실행되어 답을 `ai-review/response.md` 에 올립니다.
- 필요한 secret: `GEMINI_API_KEY` (Google AI Studio 무료 키). `to: openai` 를 쓸 때만 `OPENAI_API_KEY`.
- 자세한 형식은 `ai-review/README.md`.
