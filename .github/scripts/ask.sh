#!/usr/bin/env bash
# Claude 세션에서 쓰는 도우미: 질문 파일을 올리고 답이 올 때까지 기다렸다가 보여 줌.
# 사용법: .github/scripts/ask.sh 질문.md   (질문.md 는 ai-review/README.md 형식, id 줄은 자동으로 붙음)
set -euo pipefail
src="$1"; branch=$(git rev-parse --abbrev-ref HEAD)
case "$branch" in claude/*) ;; *) echo "claude/ 로 시작하는 브랜치에서 실행하세요"; exit 1;; esac
id="q-$(date +%Y%m%d-%H%M%S)-$RANDOM"
mkdir -p ai-review
{ echo "id: $id"; cat "$src"; } > ai-review/request.md
git add ai-review/request.md && git commit -qm "AI 검토 질문 $id"
for i in 1 2 3 4; do git push -q -u origin "$branch" && break || sleep $((2**i)); done
echo "질문 올림 ($id), 답 기다리는 중..."
for i in $(seq 1 60); do
  sleep 10
  git fetch -q origin "$branch"
  if git show "FETCH_HEAD:ai-review/response.md" 2>/dev/null | head -1 | grep -qx "id: $id"; then
    git merge -q --ff-only FETCH_HEAD || git merge -q --no-edit FETCH_HEAD
    cat ai-review/response.md; exit 0
  fi
done
echo "10분 안에 답이 안 왔어요. GitHub Actions 의 'Ask Gemini / OpenAI' 실행 기록을 확인하세요."; exit 2
