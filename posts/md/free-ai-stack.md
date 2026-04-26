---
title: I Run a 5-Agent AI Business on $0/Month. Here's the Stack.
date: April 19, 2026
slug: free-ai-stack
description: The exact model routing setup I use to run 5 AI agents continuously — zero paid API costs. OpenRouter, Gemini free tier, Nebius, and how I batch to stay within limits.
tags: [AI, free models, OpenRouter, Gemini, cost optimization]
linkedin: true
monetization: consulting
cta: Want this stack set up for your business? → [Talk to me](mailto:jewel@w3j.dev)
---

Everyone assumes running AI agents costs money. Real money — API bills, compute, the kind of thing that makes a solo founder hesitate before spinning up another workflow.

Mine cost nothing. Not "almost nothing." Zero. I run 5 agents continuously, handling content drafts, lead research, daily ops briefs, client follow-ups, and code reviews — all on free model tiers.

Here's the exact stack.

## The Model Routing Table

The key insight is that not every task needs the best model. Most tasks don't even need a good model. They need a consistent, fast, free one.

**OpenRouter free tier** — Background tasks. Lead scanning, data formatting, summarisation, simple classification. OpenRouter routes to models like Llama 3.3 70B and Gemma 3 12B for free. Rate limit: 20 requests per minute, 200 requests per day per model. Use for anything that doesn't need nuance.

**Gemini 1.5 Flash (free tier)** — Reasoning tasks. Anything requiring multi-step thinking, long context windows, or structured output. Google's free tier gives you 15 requests per minute and 1 million tokens per day. That's genuinely generous. I route all my complex agent reasoning here.

**Nebius / Kimi K2.5 (OpenCode Go)** — Complex coding and orchestration. When I need an agent to write production-quality code, architect a system, or handle a multi-tool workflow, this is the model. It's the most capable in the stack and handled via the OpenCode Go routing layer.

**GLM-5** — Content and creative writing. LinkedIn posts, blog drafts, email copy. Fast, coherent, free. Routes through the same OpenCode Go layer.

**Minimax M2.5** — The cheapest option in the stack. Cron jobs, file updates, log writing, mechanical operations that happen 50 times a day. This model costs nothing and handles volume without complaint.

## Rate Limit Reality

Here's what actually breaks people: they think "free" means "unlimited." It doesn't. The limits are:

- OpenRouter free models: 20 RPM, 200 requests/day per model
- Gemini free tier: 15 RPM, 1M tokens/day
- Nebius free allocation: generous but not infinite

The solution isn't to panic. It's to batch.

Instead of sending 10 individual classification requests per lead scan, I batch all 10 leads into a single prompt and parse the structured output. One API call, same result. This alone cuts OpenRouter usage by 80%.

I also stagger agent runs. Not everything needs to run simultaneously. My morning brief agent fires at 7AM. The lead scanner runs at 9AM. Content drafts queue up at 11AM. The EOD summary hits at 6PM. Spread across the day, the rate limits become irrelevant.

## A Full Daily Ops Cycle, Within Free Limits

Here's what a typical day looks like for the agent stack:

**6AM — Morning brief (Gemini 1.5 Flash).** One call to summarise overnight Telegram messages, flag anything urgent, and output a structured brief. ~3,000 tokens. Well within free tier.

**9AM — Lead scan (OpenRouter/Llama).** Batch 15-20 potential leads from Upwork, LinkedIn, and GitHub bounties into a single prompt. Classify intent, score relevance, output JSON. One API call, 200 tokens in, 800 tokens out.

**11AM — Content draft (GLM-5).** Take the best idea from the morning brief, write a full LinkedIn post draft. One call, ~600 tokens output. Human review before posting.

**3PM — Client follow-up drafts (Gemini).** Any pending client communications get drafted here. Batched into a single prompt grouped by client.

**6PM — EOD summary (Minimax M2.5).** Log what was completed, what's pending, what needs human action. Write to file. Done.

Total API calls across 5 agents for a full operational day: under 30. Total daily cost: $0.

## When I Do Pay

There's one situation where I open my wallet: when a client's production system needs guaranteed SLA.

Free tiers have no uptime guarantees. If OpenRouter has a bad hour, my personal ops can wait. But if a client's WhatsApp automation is down during lunch service, that's a business problem. For production client deployments, I use paid tiers — usually Anthropic or OpenAI, billed to the project. The client pays for it as part of the engagement.

My own ops? Never paid. The stack above handles everything I need.

## What's Coming

I've been refining this routing setup for about 8 months. The full breakdown — exact n8n workflows, OpenClaw agent configs, rate limit tracking scripts, and the batching patterns — is going into a Gumroad guide.

**"The Zero-Cost AI Ops Stack"** — a practical guide for solo founders and small teams who want real agentic systems without the API bill. Targeting a May 2026 release.

If you want to be notified when it drops, reply to this post or drop your email in the CTA below.

And if you need this set up for your business now — not in guide form, actually configured and running — I do that too.

→ [Talk to me](mailto:jewel@w3j.dev)
