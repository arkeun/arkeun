"""ai-review/request.md 를 읽어 제미나이(또는 OpenAI)에게 묻고 ai-review/response.md 에 답을 적는다.

request.md 형식 (맨 위 몇 줄은 설정, 나머지는 질문):
  id: 아무 글자 (답장에 그대로 붙어서 어떤 질문의 답인지 알 수 있음)
  to: gemini        (gemini 또는 openai, 없으면 gemini)
  file: index.html  (같이 보여줄 저장소 파일, 여러 줄 가능. png/jpg 는 그림으로 보냄)
  ---
  질문 내용...
"""
import time, base64, json, mimetypes, os, pathlib, sys, urllib.request, urllib.error

ROOT = pathlib.Path(".")
REQ = ROOT / "ai-review/request.md"
OUT = ROOT / "ai-review/response.md"

def parse():
    text = REQ.read_text(encoding="utf-8")
    head, sep, body = text.partition("\n---\n")
    if not sep:
        head, body = "", text
    meta = {"id": "", "to": "gemini", "files": [], "model": ""}
    for line in head.splitlines():
        k, _, v = line.partition(":")
        k, v = k.strip().lower(), v.strip()
        if k == "file" and v:
            meta["files"].append(v)
        elif k in meta and v:
            meta[k] = v
    return meta, body.strip()

def post(url, data, headers):
    req = urllib.request.Request(url, json.dumps(data).encode(), {"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r)

def load_files(paths):
    texts, images = [], []
    for p in paths:
        f = ROOT / p
        if not f.is_file():
            texts.append(f"[파일 없음: {p}]")
            continue
        mime = mimetypes.guess_type(p)[0] or ""
        if mime.startswith("image/"):
            images.append((p, mime, base64.b64encode(f.read_bytes()).decode()))
        else:
            texts.append(f"===== 파일: {p} =====\n{f.read_text(encoding='utf-8', errors='replace')}")
    return texts, images

SYSTEM = ("너는 보드게임 기록 앱 초안을 검토하는 독립 검토자다. 코드는 직접 고치지 않고 의견만 낸다. "
          "실제 이용자 입장에서, 쉬운 한국어로, 중요한 것부터 구체적으로(어느 화면, 무엇이 문제, 어떻게 바꾸면 좋은지) 답하라.")

def ask_gemini(meta, prompt, texts, images):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY 가 저장소 Secrets 에 없어요.")
    parts = [{"text": prompt}] + [{"text": t} for t in texts]
    for p, mime, b64 in images:
        parts += [{"text": f"그림: {p}"}, {"inline_data": {"mime_type": mime, "data": b64}}]
    models = [meta["model"]] if meta["model"] else ["gemini-flash-latest", "gemini-3.8-flash", "gemini-flash-lite-latest", "gemini-pro-latest"]
    errors = []
    for m in models:
      for attempt in range(4):
        try:
            r = post(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent",
                     {"system_instruction": {"parts": [{"text": SYSTEM}]}, "contents": [{"role": "user", "parts": parts}]},
                     {"x-goog-api-key": key})
            out = "".join(p.get("text", "") for p in r["candidates"][0]["content"]["parts"])
            return m, out
        except urllib.error.HTTPError as e:
            errors.append(f"{m}: {e.code} {e.read().decode(errors='replace')[:300]}")
            if e.code in (500, 503) and attempt < 3:
                time.sleep(20 * (attempt + 1)); continue
            break
        except Exception as e:
            errors.append(f"{m}: {e}"); break
    raise RuntimeError("모든 모델 실패\n" + "\n".join(errors))

def ask_openai(meta, prompt, texts, images):
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("OPENAI_API_KEY 가 저장소 Secrets 에 없어요.")
    content = [{"type": "input_text", "text": prompt}] + [{"type": "input_text", "text": t} for t in texts]
    for p, mime, b64 in images:
        content.append({"type": "input_image", "image_url": f"data:{mime};base64,{b64}"})
    model = meta["model"] or "gpt-5"
    try:
        r = post("https://api.openai.com/v1/responses",
                 {"model": model, "instructions": SYSTEM, "input": [{"role": "user", "content": content}]},
                 {"Authorization": f"Bearer {key}"})
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{model}: {e.code} {e.read().decode(errors='replace')[:300]}")
    out = "".join(c.get("text", "") for item in r.get("output", []) if item.get("type") == "message" for c in item.get("content", []))
    return model, out

def main():
    meta, prompt = parse()
    texts, images = load_files(meta["files"])
    try:
        fn = ask_openai if meta["to"].lower() in ("openai", "chatgpt", "gpt") else ask_gemini
        model, answer = fn(meta, prompt, texts, images)
        status = "ok"
    except Exception as e:
        model, answer, status = meta["to"], f"오류: {e}", "error"
    OUT.write_text(f"id: {meta['id']}\nstatus: {status}\nmodel: {model}\n---\n{answer}\n", encoding="utf-8")
    print(status, model)

if __name__ == "__main__":
    main()
