#!/usr/bin/env python3
"""
md-to-html.py — Convert Markdown post to HTML using bijou-blog template.
Usage: python3 scripts/md-to-html.py posts/md/post-name.md posts/output.html
No external dependencies required.
"""
import sys
import re
import os


def parse_frontmatter(content):
    """Extract YAML-style frontmatter from markdown content."""
    meta = {}
    body = content
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1].strip()
            body = parts[2].strip()
            for line in fm_text.splitlines():
                if ":" in line:
                    key, _, val = line.partition(":")
                    meta[key.strip()] = val.strip()
    return meta, body


def md_to_html(text):
    """Convert markdown body to HTML. No external deps."""
    lines = text.split("\n")
    html_lines = []
    in_ul = False

    for line in lines:
        stripped = line.strip()

        # Blank line — close ul if open, else paragraph break
        if not stripped:
            if in_ul:
                html_lines.append("</ul>")
                in_ul = False
            html_lines.append("")
            continue

        # H2
        if stripped.startswith("## "):
            if in_ul:
                html_lines.append("</ul>")
                in_ul = False
            html_lines.append(f"<h2>{stripped[3:]}</h2>")
            continue

        # H3
        if stripped.startswith("### "):
            if in_ul:
                html_lines.append("</ul>")
                in_ul = False
            html_lines.append(f"<h3>{stripped[4:]}</h3>")
            continue

        # Unordered list
        if stripped.startswith("- ") or stripped.startswith("* "):
            if not in_ul:
                html_lines.append("<ul>")
                in_ul = True
            item = stripped[2:]
            item = apply_inline(item)
            html_lines.append(f"  <li>{item}</li>")
            continue

        # Regular paragraph line
        if in_ul:
            html_lines.append("</ul>")
            in_ul = False

        line_html = apply_inline(stripped)
        html_lines.append(f"<p>{line_html}</p>")

    if in_ul:
        html_lines.append("</ul>")

    # Merge consecutive <p> tags that are actually the same paragraph
    # (lines that don't have blank lines between them should be one <p>)
    # Re-process: join adjacent non-empty, non-heading, non-ul lines into paragraphs
    return "\n".join(html_lines)


def apply_inline(text):
    """Apply inline markdown: bold, italic, inline code, links."""
    # Bold **text**
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    # Italic *text* (not already handled)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    # Inline code `text`
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    # Links [text](url)
    text = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', text)
    return text


def build_cta_html(cta_raw):
    """Convert CTA frontmatter string to .cta-box HTML block."""
    if not cta_raw:
        return ""
    # Parse markdown link in CTA if present
    cta_html = apply_inline(cta_raw)
    # Strip leading arrow if present
    cta_html = re.sub(r"^→\s*", "", cta_html).strip()
    # Split on → to separate text from link
    if "→" in cta_raw:
        parts = cta_raw.split("→", 1)
        label = apply_inline(parts[0].strip())
        link_part = apply_inline(parts[1].strip())
        return f"""<div class="cta-box">
  <p>{label}</p>
  <p>{link_part}</p>
</div>"""
    else:
        return f"""<div class="cta-box">
  <p>{cta_html}</p>
</div>"""


def build_html(meta, body_md):
    """Wrap converted markdown in the bijou-blog post template."""
    title = meta.get("title", "Post")
    date = meta.get("date", "")
    description = meta.get("description", "")
    tags = meta.get("tags", "")
    cta_raw = meta.get("cta", "")

    # Derive tag label from first tag
    tag_label = ""
    if tags:
        first_tag = tags.strip("[]").split(",")[0].strip()
        tag_label = f" · {first_tag.capitalize()}"

    body_html = md_to_html(body_md)
    cta_block = build_cta_html(cta_raw)

    html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} — Bijou</title>
    <meta name="description" content="{description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../style.css" />
  </head>
  <body>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <main class="post-shell">
      <a class="back-link" href="../index.html">← Back to home</a>

      <section class="post-hero">
        <div class="post-meta">{date}{tag_label}</div>
        <h1>{title}</h1>
        <p class="post-subtitle">{description}</p>
      </section>

      <article class="post-article">
        <div class="post-body">
{body_html}
{cta_block}
        </div>
      </article>
    </main>
  </body>
</html>
"""
    return html


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 md-to-html.py input.md output.html")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    meta, body_md = parse_frontmatter(content)
    html = build_html(meta, body_md)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✓ Built: {output_path}")


if __name__ == "__main__":
    main()
