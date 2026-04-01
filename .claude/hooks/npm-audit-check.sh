#!/bin/bash
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // ""')
command=$(echo "$input" | jq -r '.tool_input.command // ""')
if [ "$tool_name" != "Bash" ]; then exit 0; fi
if ! echo "$command" | grep -qE 'npm (install\b|i |ci\b)|npx |npm exec |yarn (add|install) |pnpm (add|install) '; then
  exit 0
fi
if echo "$command" | grep -q '\-\-ignore-scripts'; then exit 0; fi
echo '{"error": "BLOCKED: npm install without --ignore-scripts. Postinstall scripts are the #1 supply chain attack vector."}' >&2
exit 2
