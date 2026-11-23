import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DomainPredictionSimulator } from '../../src/features/intelligent-engine/components/DomainPredictionSimulator.tsx';

const simulator = {
  schemaVersion: 1, id: 'system-capacity', kind: 'domain-prediction',
  scenario: 'system-capacity', title: 'Capacity reasoning', description: 'Find the constrained dependency.',
  objectiveIds: ['objective-capacity'],
};

test('domain simulator renders labeled controls, keyboard-native choices and accessible progress', () => {
  const html = renderToStaticMarkup(React.createElement(DomainPredictionSimulator, { simulator }));
  assert.match(html, /aria-labelledby="domain-simulator-title-system-capacity"/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /Adjust scenario assumptions/);
  assert.match(html, /Incoming requests \/ second/);
  assert.match(html, /type="radio"/);
  assert.match(html, /Check prediction &amp; reveal/);
  assert.match(html, /Objective links: objective-capacity/);
});

test('simulator exposes explicit model and persistence boundaries', () => {
  const html = renderToStaticMarkup(React.createElement(DomainPredictionSimulator, { simulator }));
  assert.match(html, /separate simulator-completion evidence/);
  assert.match(html, /does not execute SQL/);
  assert.match(html, /Reduced-motion mode is respected/);
});
