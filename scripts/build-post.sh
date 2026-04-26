#!/bin/bash
# build-post.sh — Convert MD post to HTML
# Usage: ./build-post.sh posts/md/post-name.md
# Requires: python3
INPUT=$1
OUTPUT="${INPUT/posts\/md\//posts/}"
OUTPUT="${OUTPUT/.md/.html}"
python3 scripts/md-to-html.py "$INPUT" "$OUTPUT"
echo "Built: $OUTPUT"
