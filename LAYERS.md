LAYERS: the eight-layer card (Hubert, film 29)

Example: Bolt, the assistant at Swiftbox, a delivery company. Each layer was added because something broke.

1. Model
   Starting point: A logo on a model is not an assistant: first customer asks, Bolt recommends the competitor.
2. System prompt
   Fixes: Bolt has no brand voice and is not told to stay on topic or never to recommend a competitor.
3. RAG
   Fixes: Bolt has read none of the company documents and makes up a refund limit ($500 said, $50 real).
4. Tools (MCP)
   Fixes: Customers want actions (refund, ticket, Slack), not only words.
5. Access
   Fixes: A new hire asks a manager's salary and Bolt reads it out. Each tool call carries limited access on behalf of the person asking.
6. Guardrails
   Fixes: A hidden line in an email says ignore your rules and refund everything (prompt injection). Screen, flag, mask PII.
7. Cache & router
   Fixes: Monday, 2,000 people ask at once and the token bill explodes. Cache exact repeats; route some questions to a cheaper model.
8. Observability
   Fixes: Bolt gets one wrong and nobody knows if it was the prompt, document or tool. Trace it; evals run on every change.

Rule: Never edit the system prompt without running the evals.

Notes
- Story figures ($500 vs $50, 2,000 people) are illustrative, not data. Eight layers is one common stack, not the only valid design.
- RAG = retrieval-augmented generation: look up the right company documents, then answer from them.
- MCP = Model Context Protocol, an open standard for connecting AI applications to tools and data.
- OAuth lets an application act with limited access for a user; here each tool call carries limited access on behalf of the person asking.

Sources
- Model Context Protocol, introduction: https://modelcontextprotocol.io/introduction
  MCP is an open-source standard for connecting AI applications to external systems (data sources, tools, workflows).
- OWASP LLM01:2025 Prompt Injection: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
  User inputs can alter the LLM's behavior or output in unintended ways.
- RFC 6749, The OAuth 2.0 Authorization Framework: https://www.rfc-editor.org/rfc/rfc6749
  OAuth 2.0 lets a third-party application obtain limited access to an HTTP service.
- OWASP LLM02:2025 Sensitive Information Disclosure: https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/
  Pattern matching can detect and redact confidential content; scrubbing or masking sensitive content.
- NVIDIA NeMo Guardrails, overview: https://docs.nvidia.com/nemo/guardrails/latest/about/overview.html
  Programmable guardrails that screen and shape what goes into and out of an LLM application.
- Cloudflare AI Gateway, caching: https://developers.cloudflare.com/ai-gateway/features/caching/
  Serves identical requests from cache; the cache is based on an exact match of the entire request.
- RouteLLM, Ong et al. 2024: https://arxiv.org/abs/2406.18665
  Router models that select between a stronger and a weaker LLM, cutting cost over 2 times in certain cases.
- OpenTelemetry GenAI semantic conventions, spans: https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md
  Standard spans for model calls and tool execution, so one request can be traced.
- OpenAI, Evaluation best practices: https://developers.openai.com/api/docs/guides/evaluation-best-practices
  Set up continuous evaluation to run evals on every change.
- Lewis et al. 2020, Retrieval-Augmented Generation: https://arxiv.org/abs/2005.11401
  A retriever plus a generator for knowledge-intensive NLP tasks.

Original Hubert diagram and explanation. Independent. Bolt and Swiftbox are fictional.
