import { isMongoConnected } from './connectMongo';
import { TopicQuiz } from '../models/TopicQuiz';
import { SEED_TOPIC_QUIZZES } from '../seed/cognitiveSeed';

let seeded = false;

/**
 * Idempotently pushes hardcoded topic quizzes into MongoDB on server startup
 * so quiz definitions live in the database rather than only in static files.
 */
export async function seedCatalogToDb(): Promise<void> {
  if (seeded || !isMongoConnected()) return;
  try {
    await Promise.all(
      SEED_TOPIC_QUIZZES.map((quiz) =>
        TopicQuiz.updateOne(
          { topicId: quiz.topicId },
          {
            $set: {
              topicTitle: quiz.topicTitle,
              tier: quiz.tier,
              questions: quiz.questions,
            },
          },
          { upsert: true }
        )
      )
    );
    seeded = true;
    console.log(`[PatternForge DB] Seeded ${SEED_TOPIC_QUIZZES.length} topic quizzes into MongoDB.`);
  } catch (err) {
    console.warn(
      '[PatternForge DB] Catalog seed skipped:',
      err instanceof Error ? err.message : String(err)
    );
  }
}
