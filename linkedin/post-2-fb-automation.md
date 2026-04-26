# LinkedIn Post — F&B Automation Stack

---

Most F&B businesses in Malaysia are running their customer follow-ups on WhatsApp groups, paper notes, and memory.

I built a system that replaced all of that with a stack that costs under RM100/month and runs itself.

WhatsApp Business API catches every new customer message. n8n classifies the intent (new inquiry, returning customer, complaint) via a webhook trigger, writes the customer data to Google Sheets in real-time, fires an approved WhatsApp template message, and schedules a 3-day follow-up automatically. No one on the team touches anything unless the customer hasn't converted after the follow-up — then it escalates.

One client handled 340 new inquiries in the first month. 23% converted within the follow-up window. Owner's time on customer management: from 2 hours/day to 15 minutes.

No CRM. No per-seat licence. No training required. Just WhatsApp, n8n, and Google Sheets wired together properly.

Full breakdown of the exact workflow — node types, Sheet schema, template message structure — on the blog.

→ https://w3jdev.github.io/bijou-blog/posts/fb-automation-stack.html

#Automation #Malaysia #WhatsApp #n8n #AIAutomation
