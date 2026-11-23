# Trace prediction checkpoints

## Learner interaction

For supported deterministic algorithm-trace simulators, the learner must commit to a prediction before the next trace state is revealed. The checkpoint is placed between the current state and the next transition.

1. The runtime derives the next transition from the same deterministic trace used by the visualization.
2. It creates a bounded choice set containing the actual next transition and distinct alternatives from other trace states.
3. The correct option position rotates by trace index; it is not always the first choice.
4. The learner selects a prediction before the **Reveal next step** action becomes available.
5. After reveal, the runtime compares the choice with the deterministic next transition and explains the actual transition.
6. Previous and reset controls remain available. Editing simulator inputs clears stale prediction state.

## Evidence and privacy

- Prediction responses are transient UI state only in this increment.
- They do not update quiz score, objective mastery, lesson mastery, or the spaced-revision schedule.
- No learner prediction is represented as verified capability.
- The checkpoint is derived from the existing trace; it does not generate new lesson facts or answer keys.
- No server endpoint, new persisted personal data, external provider, worker, or paid service is introduced.

## Current support boundary

This first phase covers the two algorithm trace kinds already supported by the lesson simulator contract: binary search and bubble sort. It does not claim coverage for database, system-design, concurrency, DevOps/cloud, language-runtime, or other specialist simulators. Those require domain-specific prediction models and reviewed fixtures; generic choices must not be substituted for valid domain reasoning.

## Validation

Automated tests verify that:
- the actual next transition is present among distinct alternatives;
- the correct option position rotates across trace indexes;
- terminal/invalid positions do not produce a prediction;
- traces without a meaningful alternative safely skip the checkpoint.

The full CI workflow remains the acceptance gate for type-checking, curriculum/security checks, and the frontend build.
