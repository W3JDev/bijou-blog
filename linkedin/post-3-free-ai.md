# LinkedIn Post — Free AI Stack

---

AI agents don't cost money. Yours probably do because no one told you the routing setup.

I run 5 agents continuously — morning brief, lead scanner, content drafts, client follow-ups, EOD summary — on $0/month in API costs. Here's the actual stack:

OpenRouter free tier (Llama 3.3 70B): background tasks, lead classification, data formatting. 200 req/day per model. I batch 15-20 items per call so I never hit the limit. Gemini 1.5 Flash free tier: reasoning, long-context analysis, structured output. 15 RPM, 1M tokens/day — genuinely generous. Nebius/Kimi K2.5 via OpenCode Go: complex coding and orchestration. Most capable model in the stack. GLM-5: content and creative writing. Minimax M2.5: mechanical cron jobs that run 50 times a day.

Total daily API calls across all 5 agents: under 30. Total cost: $0.

The only time I pay is when a client's production system needs SLA guarantees. My own ops have run free for 8 months straight.

Full breakdown — routing table, batching patterns, daily ops schedule — on the blog. A complete guide (n8n configs, rate limit scripts, everything) is coming to Gumroad in May 2026.

→ https://w3jdev.github.io/bijou-blog/posts/free-ai-stack.html

#AI #OpenRouter #Agents #CostOptimization #SoloFounder
