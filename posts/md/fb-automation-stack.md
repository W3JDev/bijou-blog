---
title: The Exact Stack I Use to Automate F&B Client Onboarding (No Code, All Results)
date: April 12, 2026
slug: fb-automation-stack
description: How I built a WhatsApp-first automation system for F&B businesses in Malaysia that handles onboarding, follow-ups, and reporting without a single line of code.
tags: [automation, F&B, WhatsApp, Malaysia, n8n]
linkedin: true
monetization: consulting
cta: Need this built for your F&B business? I take 2-3 clients a month. → [Book a call](mailto:jewel@w3j.dev)
---

The average F&B owner in Malaysia is running customer management on three WhatsApp groups, a paper notepad, and memory. That's not an exaggeration — I've seen it firsthand. And when a new customer messages in, the process is: reply manually, forget to follow up, lose them to a competitor who responded faster.

There's no CRM. There's no system. There's just chaos that looks organised until it isn't.

I built an automation stack that fixes this. No custom code. No expensive software. Just WhatsApp Business API, n8n, Google Sheets, and OpenClaw wired together properly.

Here's exactly how it works.

## The Stack

**WhatsApp Business API** — The entry point. Every customer message comes through here via Meta's official API. This gives you structured webhooks, template message sending, and read receipts. Not the WhatsApp Business app — the actual API. There's a difference, and it matters.

**n8n** — The brain. Self-hosted workflow automation. Every trigger, every conditional, every data transformation runs here. I run it on a RM35/month VPS. It handles hundreds of workflows without breaking a sweat.

**Google Sheets** — The database. Not because it's ideal, but because F&B staff actually use it. Every team member knows how to open a spreadsheet. No onboarding required.

**OpenClaw** — The AI layer. Handles intelligent follow-up messages, categorises customer intent, and drafts responses that actually sound human.

## The Workflow

A new customer sends a WhatsApp message. Here's what happens in the next 30 seconds without anyone touching a keyboard:

**Step 1 — Webhook Trigger.** n8n has a Webhook node listening for incoming WhatsApp messages from the Meta API. The moment a message arrives, the workflow fires.

**Step 2 — Intent Classification.** An OpenClaw agent reads the message and categorises it: new customer inquiry, returning customer, complaint, or general question. This classification drives every downstream action.

**Step 3 — Google Sheets Write.** An n8n Google Sheets node appends a new row with the customer's phone number, name (if provided), message content, timestamp, category, and assigned status. The sheet becomes the live CRM dashboard.

**Step 4 — Onboarding Flow Trigger.** If classified as "new customer inquiry," n8n triggers a WhatsApp template message via the Send Message node. The template is pre-approved by Meta — something like: "Hi [Name], thanks for reaching out to [Restaurant]. Here's what we offer and how to book..." — personalised with data pulled from the Sheet.

**Step 5 — Follow-Up Scheduling.** A Wait node in n8n holds the workflow for 3 days. If the customer hasn't responded or converted (tracked via a status column in the Sheet), n8n sends a second WhatsApp template: a gentle nudge with a specific offer or reminder.

**Step 6 — Escalation.** If still no conversion after the follow-up, the workflow flags the row in red on the Sheet and sends an internal WhatsApp notification to the owner. Human eyes only come in when automation has already done the heavy lifting.

The entire flow — from first message to structured follow-up — runs without anyone on the F&B team doing anything.

## Why This Beats a CRM

I've tried recommending proper CRMs to F&B clients. HubSpot, Zoho, Freshsales. Every time, the same result: the team uses it for two weeks, then goes back to WhatsApp because "it's easier."

The problem isn't discipline. The problem is that CRMs are built for sales teams who sit at desks. F&B staff are on their feet, serving tables, managing kitchens. A CRM that requires desktop login is a CRM that won't get used.

This stack beats a CRM for three reasons:

**Speed.** WhatsApp Business API has a 98% open rate. Your follow-up messages get read. Email open rates for the same demographic hover around 20%. The channel matters.

**Cost.** n8n self-hosted: RM35/month VPS. Google Sheets: free. WhatsApp Business API: per-conversation pricing, typically under RM0.30 per conversation window. Total monthly cost for a restaurant handling 200 new inquiries: under RM100. A mid-tier CRM seat costs more than that per user.

**Familiarity.** Your team already lives in WhatsApp. Your customers already live in WhatsApp. The friction of switching channels is zero. And Google Sheets means your manager can pull a report on mobile without training.

## What This Actually Delivers

For one F&B client running a mid-size restaurant chain in KL, this system handled 340 new customer inquiries in the first month. 23% converted within the 3-day follow-up window — customers who would have been lost in the old manual process. Owner's time spent on customer follow-up went from ~2 hours/day to 15 minutes of reviewing the escalation list.

That's what F&B automation Malaysia actually looks like in practice. Not AI magic. Just the right tools wired together correctly.

## Building This for Your Business

The core workflow takes about 4-6 hours to build properly from scratch — assuming you already have WhatsApp Business API access approved by Meta (that part takes 1-3 days). The Google Sheets schema and n8n WhatsApp webhook patterns I've refined across multiple clients, so I'm not starting from zero.

If you want this running in your business, I work with 2-3 F&B clients a month. That's intentional — quality over volume.

→ [Book a call](mailto:jewel@w3j.dev)
