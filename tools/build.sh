#!/usr/bin/env bash
# Rebuild agent-harness-deck.html from slides/agent-harness-engineering/index.tsx
# Requires: npm i -D esbuild react react-dom
set -euo pipefail
cd "$(dirname "$0")"
npx esbuild entry-viewer.tsx --bundle --minify --jsx=automatic \
  --alias:@open-slide/core=./core-shim.tsx \
  --define:process.env.NODE_ENV='"production"' \
  --outfile=viewer.js --log-level=warning
node -e '
const fs=require("fs");
const t=fs.readFileSync("template.html","utf8");
const js=fs.readFileSync("viewer.js","utf8");
fs.writeFileSync("../agent-harness-deck.html", t.replace("/*__VIEWER__*/", () => js));
'
rm -f viewer.js
echo "built ../agent-harness-deck.html"
