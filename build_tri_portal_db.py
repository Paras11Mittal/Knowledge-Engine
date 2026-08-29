import os
import json
import re

drk_dir = r"C:\Users\Asus\.gemini\antigravity\scratch\healthygamer_knowledge_base\articles"
naval_dir = r"C:\Users\Asus\.gemini\antigravity\scratch\healthygamer_knowledge_base\articles_naval"
biopic_dir = r"C:\Users\Asus\.gemini\antigravity\scratch\healthygamer_knowledge_base\articles_biopics"

all_articles = []

def parse_markdown_file(file_path, default_author, default_kb):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if not fm_match:
        return None

    yaml_text = fm_match.group(1)
    content = fm_match.group(2)

    metadata = {}
    for line in yaml_text.split("\n"):
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        
        if val.startswith("[") and val.endswith("]"):
            val = [item.strip().strip('"').strip("'") for item in val[1:-1].split(",") if item.strip()]
        
        metadata[key] = val

    filename = os.path.basename(file_path)
    article_id = filename.split("-")[0].upper()

    return {
        "id": article_id,
        "filename": filename,
        "author": metadata.get("author", default_author),
        "knowledge_base": default_kb,
        "title": metadata.get("title", "Untitled"),
        "slug": metadata.get("slug", ""),
        "pillar": metadata.get("pillar", ""),
        "reading_time": metadata.get("reading_time", "12 mins"),
        "target_struggle": metadata.get("target_struggle", ""),
        "prerequisites": metadata.get("prerequisites", []),
        "content": content
    }

# 1. Parse Dr. K articles
if os.path.exists(drk_dir):
    for fname in sorted(os.listdir(drk_dir)):
        if fname.endswith(".md") and fname != "SITEMAP.md":
            parsed = parse_markdown_file(os.path.join(drk_dir, fname), "Dr. Alok Kanojia", "HealthyGamerGG")
            if parsed:
                all_articles.append(parsed)

# 2. Parse Naval articles
if os.path.exists(naval_dir):
    for fname in sorted(os.listdir(naval_dir)):
        if fname.endswith(".md") and fname != "SITEMAP_NAVAL.md":
            parsed = parse_markdown_file(os.path.join(naval_dir, fname), "Naval Ravikant", "Naval Ravikant")
            if parsed:
                all_articles.append(parsed)

# 3. Parse Biopic articles
if os.path.exists(biopic_dir):
    for fname in sorted(os.listdir(biopic_dir)):
        if fname.endswith(".md") and fname != "SITEMAP_BIOPICS.md":
            parsed = parse_markdown_file(os.path.join(biopic_dir, fname), "Biopic Series", "Luminaries & Biopics")
            if parsed:
                all_articles.append(parsed)

# Write to articles_db.js locally and on D: drive
output_js_local = r"C:\Users\Asus\.gemini\antigravity\scratch\healthygamer_knowledge_base\articles_db.js"
output_js_ddrive = r"D:\HealthyGamer_Naval_Knowledge_Base\articles_db.js"

js_content = "window.ARTICLES_DB = " + json.dumps(all_articles, indent=2) + ";"

with open(output_js_local, "w", encoding="utf-8") as f:
    f.write(js_content)

if os.path.exists(os.path.dirname(output_js_ddrive)):
    with open(output_js_ddrive, "w", encoding="utf-8") as f:
        f.write(js_content)

print(f"Successfully generated articles_db.js with {len(all_articles)} total articles across 3 Portals.")
