import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/apiFetch';
import { LearningRuntime } from './LearningRuntime';
import { VisualizationRenderer, type LessonVisual } from './VisualizationRenderer';

type QuizQuestion = { question: string; options: string[]; correctAnswer?: string | string[]; explanation: string };
type PracticeTask = { title: string; instructions: string; expectedOutcome: string };
type PublishedLesson = {
  title: string;
  summary: string;
  learningObjectives?: string[];
  modules?: Array<{ sectionId: string; title: string; contentMarkdown: string; keyPoints?: string[]; reasoningSteps?: string[]; codeExamples?: Array<{ language: string; code: string; explanation: string }> }>;
  visualizations?: LessonVisual[];
  quiz?: QuizQuestion[];
  practiceTasks?: PracticeTask[];
};

export function PublishedLessonView({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<PublishedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch(`/api/authoring/published/${encodeURIComponent(lessonId)}`)
      .then(async (response) => {
        const payload = await response.json() as { lesson?: PublishedLesson; message?: string; code?: string };
        if (!response.ok || !payload.lesson) throw new Error(payload.message || payload.code || 'This lesson is not published or is no longer available.');
        if (active) setLesson(payload.lesson);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unable to load this lesson.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lessonId]);

  if (loading) return <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950"><p className="mx-auto max-w-4xl text-sm text-slate-500">Loading published lesson…</p></main>;
  if (error || !lesson) return <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950"><div className="mx-auto max-w-4xl rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300">{error || 'Lesson unavailable.'}</div></main>;

  return <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
    <article className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <a href="/" className="text-xs font-semibold text-sky-600 hover:underline">← Tutorial Hub</a>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Published learning lesson</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{lesson.summary}</p>
        {lesson.learningObjectives?.length ? <div className="mt-4"><h2 className="text-xs font-semibold">Learning objectives</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300">{lesson.learningObjectives.map((objective, index) => <li key={index}>{objective}</li>)}</ul></div> : null}
      </header>
      {lesson.modules?.map((module) => <section key={module.sectionId} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold">{module.title}</h2>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{module.contentMarkdown}</div>
        {module.keyPoints?.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500">{module.keyPoints.map((point, index) => <li key={index}>{point}</li>)}</ul> : null}
        {module.reasoningSteps?.length ? <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-slate-500">{module.reasoningSteps.map((step, index) => <li key={index}>{step}</li>)}</ol> : null}
        {module.codeExamples?.map((example, index) => <div key={index} className="mt-4"><p className="text-[10px] font-semibold uppercase text-slate-500">{example.language}</p><pre className="mt-1 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{example.code}</pre><p className="mt-1 text-xs text-slate-500">{example.explanation}</p></div>)}
      </section>)}
      {lesson.visualizations?.length ? <section className="space-y-3"><h2 className="text-sm font-semibold">Diagrams and visualizations</h2>{lesson.visualizations.map((visual) => <VisualizationRenderer key={visual.id} visual={visual}/>)}</section> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold">Your learning progress</h2>
        <p className="mt-1 text-xs text-slate-500">Your quiz results and practice progress are private to your account.</p>
        <div className="mt-4"><LearningRuntime jobId={lessonId} quiz={lesson.quiz || []} practiceTasks={lesson.practiceTasks || []}/></div>
      </section>
    </article>
  </main>;
}
