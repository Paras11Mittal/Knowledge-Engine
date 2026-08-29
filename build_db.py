import os
import json
import re

articles_dir = r"C:\Users\Asus\.gemini\antigravity\scratch\healthygamer_knowledge_base\articles"
articles_data = []

def parse_frontmatter_and_content(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Match YAML frontmatter
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
        
        # Parse arrays if needed
        if val.startswith("[") and val.endswith("]"):
            val = [item.strip().strip('"').strip("'") for item in val[1:-1].split(",") if item.strip()]
        
        metadata[key] = val

    filename = os.path.basename(file_path)
    article_id = filename.split("-")[0]

    return {
        "id": article_id,
        "filename": filename,
        "title": metadata.get("title", "Untitled"),
        "slug": metadata.get("slug", ""),
        "pillar": metadata.get("pillar", ""),
        "reading_time": metadata.get("reading_time", "10 mins"),
        "target_struggle": metadata.get("target_struggle", ""),
        "prerequisites": metadata.get("prerequisites", []),
        "content": content
    }

files = sorted(os.listdir(articles_dir))
for fname in files:
    if fname.endswith(".md"):
        fpath = os.path.join(articles_dir, fname)
        parsed = parse_frontmatter_and_content(fpath)
        if parsed:
            articles_data.append(parsed)

js_content = "window.ARTICLES_DB = " + json.dumps(articles_data, indent=2) + ";"

output_js = r"C:\Users\Asus\.gemini\antigravity\scratch\healthygamer_knowledge_base\articles_db.js"
with open(output_js, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Successfully generated articles_db.js with {len(articles_data)} articles.")
