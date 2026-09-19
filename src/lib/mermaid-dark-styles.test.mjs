import { test } from 'node:test';
import assert from 'node:assert/strict';
import { darkPairFor, remapMermaidStyles } from './mermaid-dark-styles.mjs';

test('pastel red maps to dark red fill + error stroke', () => {
  assert.deepEqual(darkPairFor('#ffcdd2'), { fill: '#4a2626', stroke: '#f87171' });
});

test('pastel green maps to dark green', () => {
  assert.deepEqual(darkPairFor('#c8e6c9'), { fill: '#1f3a2c', stroke: '#4ade80' });
  assert.deepEqual(darkPairFor('#90EE90'), { fill: '#1f3a2c', stroke: '#4ade80' });
});

test('pastel blue / cyan maps to dark blue', () => {
  assert.deepEqual(darkPairFor('#e1f5ff'), { fill: '#1e2f45', stroke: '#60a5fa' });
  assert.deepEqual(darkPairFor('#2196F3'), { fill: '#1e2f45', stroke: '#60a5fa' });
});

test('pastel orange / yellow maps to amber', () => {
  assert.deepEqual(darkPairFor('#fff3e0'), { fill: '#3f3320', stroke: '#efbf57' });
  assert.deepEqual(darkPairFor('#ffd43b'), { fill: '#3f3320', stroke: '#efbf57' });
});

test('grey maps to neutral', () => {
  assert.deepEqual(darkPairFor('#9E9E9E'), { fill: '#3a3630', stroke: '#9b958a' });
});

test('3-digit hex is accepted', () => {
  assert.deepEqual(darkPairFor('#f00'), { fill: '#4a2626', stroke: '#f87171' });
});

test('remapMermaidStyles rewrites fill/stroke/color and keeps other props', () => {
  const src = [
    'graph LR',
    '    A[Start] --> B[End]',
    '    style A fill:#c8e6c9,stroke:#2e7d32',
    '    style B fill:#9E9E9E,color:#fff,stroke-width:2px',
  ].join('\n');
  const out = remapMermaidStyles(src);
  assert.equal(
    out,
    [
      'graph LR',
      '    A[Start] --> B[End]',
      '    style A fill:#1f3a2c,stroke:#4ade80,color:#fbf9f4',
      '    style B fill:#3a3630,stroke:#9b958a,color:#fbf9f4,stroke-width:2px',
    ].join('\n'),
  );
});

test('lines without a hex fill are untouched', () => {
  const src = '    style A stroke-dasharray: 5 5\n    A --> B';
  assert.equal(remapMermaidStyles(src), src);
});
