# Cloud models in Open WebUI

OneOS does not run Ollama, llama.cpp, or a local model server. Open WebUI is the interface; inference is performed by the cloud provider selected for each chat.

## Add a provider

1. Open `https://ai.oneos.home.arpa` and sign in as an administrator.
2. Open Admin Settings → Connections.
3. Add a hosted provider connection, then enter the API base URL and API key.
4. Choose a model in a new chat. If model discovery fails, add the model ID manually where the provider supports it.

Open WebUI documents direct connections for OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Groq, OpenRouter, Azure OpenAI, Amazon Bedrock and other OpenAI-compatible services. Not every endpoint exposes the same capabilities: tool calling, images, audio, model listing and context sizes vary.

## Common connection endpoints

| Provider | API base URL | Notes |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | Use your OpenAI API key |
| Anthropic | `https://api.anthropic.com/v1` | Open WebUI has an Anthropic compatibility path; use the provider's native option where available |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | OpenAI-compatible endpoint; model and tool support vary |
| OpenRouter | `https://openrouter.ai/api/v1` | Large model catalogue; add a model allow-list rather than exposing every model |
| DeepSeek | `https://api.deepseek.com/v1` | OpenAI-compatible |
| Mistral | `https://api.mistral.ai/v1` | OpenAI-compatible |
| Groq | `https://api.groq.com/openai/v1` | OpenAI-compatible |
| Azure OpenAI | Your Azure resource endpoint | Select the Azure provider mode and set its API version/deployment IDs |

These are API endpoints, not free access. You need an API key and may incur usage charges under the provider's current pricing. Do not put API keys in this Git repository or a screenshot. Add them in Open WebUI's connection settings; Open WebUI stores its configuration in the persistent `data/open-webui` folder.

For OpenAI-compatible providers, Open WebUI supports a standard chat-completions interface. Some providers do not implement the standard `/models` endpoint; a failed "Verify" button does not always mean chat is incompatible. In that case, add the provider's exact model ID manually and test a small prompt.

## Privacy

Selecting a hosted model sends the prompt and any attached context to that provider. If OneOS Connect tools are enabled, tool results can also be included in the model context. Check each provider's data-retention and privacy terms before connecting private documents.
