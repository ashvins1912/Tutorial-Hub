import type { ContentGenerationProvider } from './contentGeneration.provider';
import { createContentGenerationProvider } from './contentGeneration.provider';
import { buildGenerationPrompt } from './contentGeneration.prompts';
import { validateGeneratedLesson } from './contentGeneration.validator';
import type { CanonicalLearningDraft, ContentAnalysis, GenerationMetadata } from '../contentAuthoring.types';

export async function generateLearningDraft(input: {
  draft: CanonicalLearningDraft;
  analysis: ContentAnalysis;
  provider?: ContentGenerationProvider;
  signal?: AbortSignal;
}) {
  const provider = input.provider || createContentGenerationProvider();
  const startedAt = Date.now();
  const result = await provider.generate({
    prompt: buildGenerationPrompt({
      title: input.draft.title,
      domain: input.draft.domain,
      kind: input.draft.kind,
      level: input.draft.level,
      sourceText: input.draft.sourceText,
      sections: input.draft.sections,
      learningObjectives: input.draft.learningObjectives,
      prerequisites: input.draft.prerequisites,
      concepts: input.draft.concepts,
    }),
    signal: input.signal,
  });
  const validated = validateGeneratedLesson(result.lesson, input.draft.sections);
  const metadata: GenerationMetadata = {
    status: 'generated',
    provider: result.provider,
    model: result.model,
    generatedAt: new Date(),
    durationMs: Date.now() - startedAt,
  };
  return { lesson: validated.lesson, metadata, warnings: validated.warnings };
}
