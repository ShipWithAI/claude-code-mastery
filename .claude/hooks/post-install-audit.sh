#!/bin/bash
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // ""')
command=$(echo "$input" | jq -r '.tool_input.command // ""')
if [ "$tool_name" != "Bash" ]; then exit 0; fi
if ! echo "$command" | grep -qE 'npm (install\b|i |ci\b)|npx |npm exec |yarn (add|install) |pnpm (add|install) '; then
  exit 0
fi
audit_output=$(npm audit --json 2>/dev/null)
vuln_count=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.total // 0')
if [ "$vuln_count" -gt 0 ]; then
  high=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.high // 0')
  critical=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.critical // 0')
  echo "WARNING: npm audit found $vuln_count vulnerabilities ($critical critical, $high high). Run 'npm audit' for details."
fi
exit 0
