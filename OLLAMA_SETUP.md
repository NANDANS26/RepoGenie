# RepoGenie Local Ollama (Phi-3) Setup

## Runtime contract

The React/Vite client calls `POST {VITE_OLLAMA_BASE_URL}/api/chat` with `model`, `messages`, `stream: false`, `format: "json"`, and generation settings. The default model is `phi3:latest`, and the default endpoint is `http://localhost:11434`.

## Install and run

1. Install Ollama from https://ollama.com/download.
2. Pull the model: `ollama pull phi3:latest`.
3. Copy `.env.example` to `.env` and set `VITE_GITHUB_API_KEY`, `VITE_OLLAMA_BASE_URL`, and `VITE_OLLAMA_MODEL` as appropriate.
4. Start the app with `npm install` then `npm run dev`; the current Vite config serves it at `http://localhost:3000`.
5. Keep Ollama running. If CORS blocks requests, add the exact local app origin to Ollama's `OLLAMA_ORIGINS` and restart it.

## Behavior

The model returns JSON because RepoGenie parses the generated content into the existing `AIContent`/insights contracts. Generation is sequential by default to limit local memory pressure. Ollama connection errors, HTTP failures, empty responses, malformed JSON, and timeouts are surfaced rather than silently producing mock text. For deliberate UI-only testing, `VITE_USE_MOCK_AI=true` enables the existing mock generator.

## Privacy

AI inference is local by default. The app still calls GitHub APIs to retrieve repository information, and the configured Ollama base URL receives the prompt content. Do not set that URL to an untrusted service. For the local-only workflow, use `http://localhost:11434`.
