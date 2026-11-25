import assert from 'node:assert/strict';
import test from 'node:test';
import { useUnifiedLearningStore } from '../../src/features/pattern-forge-unified/useUnifiedLearningStore.ts';

test('selecting the already-active Pattern Forge topic is a no-op', () => {
  const store = useUnifiedLearningStore;
  const initial = store.getState();
  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications += 1;
  });

  initial.setActiveTopicId(initial.activeTopicId, initial.activeStage);

  assert.equal(notifications, 0, 'same topic, stage, and workspace tab must not notify subscribers');
  unsubscribe();
});
