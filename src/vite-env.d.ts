/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_API_KEY?: string
  readonly VITE_OLLAMA_BASE_URL?: string
  readonly VITE_OLLAMA_MODEL?: string
  readonly VITE_USE_MOCK_AI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
