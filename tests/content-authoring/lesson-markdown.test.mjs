import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LessonMarkdown } from '../../src/features/intelligent-engine/components/LessonMarkdown.tsx';

test('renders instructional Markdown structures without interpreting raw HTML', () => {
  const html = renderToStaticMarkup(React.createElement(LessonMarkdown, { source: '# Concept\n\nA **strong** idea with `code`.\n\n- First\n- Second\n\n> Remember this\n\n```java\nint answer = 42;\n```\n\n| Term | Meaning |\n| --- | --- |\n| O(1) | Constant |\n\n<script>alert(1)</script>' }));
  assert.match(html, /<h2/);
  assert.match(html, /<strong>strong<\/strong>/);
  assert.match(html, /<code>code<\/code>/);
  assert.match(html, /<ul/);
  assert.match(html, /<blockquote/);
  assert.match(html, /<pre/);
  assert.match(html, /<table/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});

test('only renders HTTP(S) Markdown links as anchors', () => {
  const html = renderToStaticMarkup(React.createElement(LessonMarkdown, { source: '[safe](https://example.com) [unsafe](javascript:alert(1))' }));
  assert.match(html, /href="https:\/\/example.com"/);
  assert.doesNotMatch(html, /href="javascript:/);
});
