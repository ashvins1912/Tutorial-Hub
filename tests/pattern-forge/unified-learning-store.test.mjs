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

test('hydration is idempotent after the store has hydrated', async () => {
  const store = useUnifiedLearningStore;
  const before = store.getState();
  // Mark hydrated to model a workspace remount after the first successful/offline
  // hydration. A later mount must not publish a second identical state update.
  store.setState({ hydrated: true });
  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications += 1;
  });

  await store.getState().hydrateFromServer();

  assert.equal(notifications, 0, 'hydrating an already-hydrated store must be a no-op');
  unsubscribe();
  store.setState({ hydrated: before.hydrated });
});
