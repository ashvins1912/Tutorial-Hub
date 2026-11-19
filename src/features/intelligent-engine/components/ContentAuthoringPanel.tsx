import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, FileJson, FileText, Loader2, Plus, RefreshCw, UploadCloud } from 'lucide-react';
import { apiFetch } from '../../../lib/apiFetch';
import { VisualizationRenderer } from './VisualizationRenderer';
import { LearningRuntime } from './LearningRuntime';

type LearningSection = {
  id: string;
  title: string;
  purpose: string;
  required: boolean;
  blockType: 'explanation' | 'reasoning' | 'visualization' | 'code' | 'quiz' | 'exercise' | 'assessment' | 'reference';
};
type AuthoringJob = {
  id: string;
  fileName: string;
  status: string;
  publishedAt?: string | null;
  generation?: { status: string; provider?: string; model?: string; generatedAt?: string; durationMs?: number; errorCode?: string };
  generatedLesson?: { title: string; summary: string; learningObjectives: string[]; modules: Array<{ sectionId: string; title: string; contentMarkdown: string; keyPoints: string[]; reasoningSteps: string[]; codeExamples: Array<{ language: string; code: string; explanation: string }> }>; visualizations: Array<{ id: string; title: string; type: string; description: string; source: string; steps?: Array<{ title: string; explanation: string }> }>; quiz: Array<{ question: string; options: string[]; correctAnswer: string | string[]; explanation: string }>; practiceTasks: Array<{ title: string; instructions: string; expectedOutcome: string }> };
  analysis: {
    domain: string;
    kind: string;
    level: string;
    confidence: number;
    title: string;
    topics: string[];
    prerequisites: string[];
    concepts: string[];
    detected: { headings: string[]; codeBlocks: number; tables: number; wordCount: number };
    recommendedVisualizations: string[];
    outline: LearningSection[];
    warnings: string[];
  };
};

const TEMPLATE_LABELS: Record<string, string> = {
  'universal-json': 'Universal JSON',
  markdown: 'Markdown lesson',
  'dsa-problem': 'DSA problem',
  'ml-ai-concept': 'ML / AI concept',
  'database-concept': 'Database concept',
  'system-design': 'System design',
};
const ACCEPTED = '.json,.md,.markdown,.txt,.yaml,.yml,.java,.js,.jsx,.ts,.tsx,.py,.sql';

export function ContentAuthoringPanel() {
  const [jobs, setJobs] = useState<AuthoringJob[]>([]);
  const [selected, setSelected] = useState<AuthoringJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sections, setSections] = useState<LearningSection[]>([]);

  const loadJobs = async () => {
    try {
      const response = await apiFetch('/api/authoring/jobs');
      if (!response.ok) {
        if (response.status !== 503 && response.status !== 403) throw new Error('Unable to load authoring jobs.');
        return;
      }
      const payload = await response.json() as { jobs: Array<Record<string, unknown>> };
      setJobs(payload.jobs.map((job) => ({
        id: String(job._id),
        fileName: String(job.fileName),
        status: String(job.status),
        publishedAt: typeof job.publishedAt === 'string' ? job.publishedAt : null,
        generation: job.generation as AuthoringJob['generation'],
        generatedLesson: job.generatedLesson as AuthoringJob['generatedLesson'],
        analysis: job.analysis as AuthoringJob['analysis'],
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load authoring jobs.');
    }
  };

  useEffect(() => { void loadJobs(); }, []);

  const uploadFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!['json','md','markdown','txt','yaml','yml','java','js','jsx','ts','tsx','py','sql'].includes(extension)) {
        throw new Error('Phase 1 accepts text-based JSON, Markdown, TXT, YAML and source-code files. PDF/DOCX extraction is not enabled yet.');
      }
      if (file.size > 1024 * 1024) throw new Error('Please keep each source file below 1 MB for this first release.');
      const content = await file.text();
      const response = await apiFetch('/api/authoring/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type || 'text/plain', content }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || payload.message || 'Upload processing failed.');
      const job = payload.job as AuthoringJob;
      setSelected(job);
      setSections(job.analysis.outline);
      setNotice('Source analyzed and saved as a draft. Review the suggested learning structure before the next generation phase.');
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process this file.');
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = async (id: string) => {
    setError('');
    try {
      const response = await apiFetch(`/api/authoring/templates/${id}/download`);
      if (!response.ok) throw new Error('Template download requires an authorized author account.');
      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') || '';
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || `${id}-template`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download template.');
    }
  };

  const updateAnalysis = (patch: Partial<AuthoringJob['analysis']>) => {
    setSelected((current) => current ? { ...current, analysis: { ...current.analysis, ...patch } } : current);
  };

  const saveStructure = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const response = await apiFetch(`/api/authoring/jobs/${selected.id}/structure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections, metadata: { title: selected.analysis.title, domain: selected.analysis.domain, kind: selected.analysis.kind, level: selected.analysis.level } }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to save learning structure.');
      setNotice('Learning structure saved. The source remains a draft until generated, validated and approved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save structure.');
    } finally {
      setSaving(false);
    }
  };

  const generateLesson = async () => {
    if (!selected) return;
    setGenerating(true); setError(''); setNotice('');
    try {
      const saved = await apiFetch(`/api/authoring/jobs/${selected.id}/structure`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sections, metadata: { title: selected.analysis.title, domain: selected.analysis.domain, kind: selected.analysis.kind, level: selected.analysis.level } }) });
      if (!saved.ok) throw new Error('Save the learning blueprint before generation.');
      const response = await apiFetch(`/api/authoring/jobs/${selected.id}/generate`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || payload.code || 'AI generation failed.');
      setSelected((current) => current ? { ...current, generation: payload.job.generation, generatedLesson: payload.job.generatedLesson } : current);
      setNotice('AI lesson generated and saved as an unverified draft. Review every section, diagram, answer and code example before using it.');
      await loadJobs();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to generate the lesson.'); }
    finally { setGenerating(false); }
  };
  const togglePublish = async () => {
    if (!selected?.generatedLesson) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await apiFetch(`/api/authoring/jobs/${selected.id}/publish`, {
        method: selected.publishedAt ? 'DELETE' : 'POST',
      });
      const payload = await response.json() as { publishedAt?: string | null; message?: string; code?: string };
      if (!response.ok) throw new Error(payload.message || payload.code || 'Unable to update publication status.');
      setSelected((current) => current ? { ...current, publishedAt: payload.publishedAt || null } : current);
      setNotice(payload.publishedAt ? 'Lesson published. Authenticated learners can now load it and save their own progress.' : 'Lesson unpublished. It is no longer available to learners.');
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update publication status.');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index: number, patch: Partial<LearningSection>) => {
    setSections((current) => current.map((section, i) => i === index ? { ...section, ...patch } : section));
  };

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400">Author workspace · AI orchestration</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Intelligent Content Studio</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Upload technical knowledge, detect its domain and learning level, then review a subject-aware learning blueprint. Nothing is published automatically.</p>
        </div>
        <button type="button" onClick={() => void loadJobs()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold hover:border-sky-500">
          <RefreshCw className="w-3.5 h-3.5"/> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)] gap-5 p-5">
        <div className="space-y-4">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-6 text-center hover:border-sky-500 transition-colors">
            {busy ? <Loader2 className="h-8 w-8 animate-spin text-sky-500"/> : <UploadCloud className="h-8 w-8 text-sky-500"/>}
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{busy ? 'Analyzing source…' : 'Choose a knowledge file'}</span>
            <span className="text-xs text-slate-500">JSON · Markdown · TXT · YAML · Java · JavaScript · TypeScript · Python · SQL · up to 1 MB</span>
            <input type="file" accept={ACCEPTED} disabled={busy} className="sr-only" onChange={(event) => { void uploadFile(event.target.files?.[0]); event.currentTarget.value = ''; }}/>
          </label>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><FileJson className="h-4 w-4 text-sky-500"/> Download authoring formats</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(TEMPLATE_LABELS).map(([id, label]) => (
                <button key={id} type="button" onClick={() => void downloadTemplate(id)} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs hover:border-sky-500">
                  <span>{label}</span><Download className="h-3.5 w-3.5 text-slate-500"/>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-sky-500"/> Recent authoring jobs</div>
              <span className="text-xs text-slate-500">{jobs.length} saved</span>
            </div>
            {jobs.length === 0 ? <p className="text-xs text-slate-500">Uploaded drafts will appear here.</p> : jobs.map((job) => (
              <button key={job.id} type="button" onClick={() => { setSelected(job); setSections(job.analysis.outline || []); }} className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs ${selected?.id === job.id ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800' : 'bg-slate-50 dark:bg-slate-950 border border-transparent'}`}>
                <span className="min-w-0"><span className="block truncate font-semibold">{job.analysis.title || job.fileName}</span><span className="text-slate-500">{job.fileName}</span></span>
                <span className="shrink-0 text-[10px] uppercase text-emerald-600">{job.status.replace('_',' ')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {error && <div role="alert" className="flex gap-2 rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 p-3 text-xs text-rose-800 dark:text-rose-200"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
          {notice && <div role="status" className="flex gap-2 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 text-xs text-emerald-800 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4 shrink-0"/>{notice}</div>}
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{selected.analysis.title}</h3>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 text-[10px] font-semibold">DRAFT · REVIEW REQUIRED</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="rounded-lg bg-slate-50 dark:bg-slate-950 p-2"><span className="block text-slate-500 mb-1">Topic domain</span><select value={selected.analysis.domain} onChange={(event) => updateAnalysis({ domain: event.target.value })} className="w-full bg-transparent font-semibold outline-none"><option value="DSA">DSA</option><option value="MACHINE_LEARNING">Machine Learning</option><option value="AI">Artificial Intelligence</option><option value="DATABASE">Database</option><option value="SYSTEM_DESIGN">System Design</option><option value="SOFTWARE_ENGINEERING">Software Engineering</option><option value="GENERAL">General / Other</option></select></label>
                  <label className="rounded-lg bg-slate-50 dark:bg-slate-950 p-2"><span className="block text-slate-500 mb-1">Content type</span><select value={selected.analysis.kind} onChange={(event) => updateAnalysis({ kind: event.target.value })} className="w-full bg-transparent font-semibold outline-none"><option value="algorithm">Algorithm</option><option value="coding_problem">Coding problem</option><option value="concept">Concept</option><option value="model">Model</option><option value="architecture">Architecture</option><option value="database_concept">Database concept</option><option value="case_study">Case study</option><option value="tutorial">Tutorial</option><option value="question_bank">Question bank</option><option value="custom">Custom</option></select></label>
                  <label className="rounded-lg bg-slate-50 dark:bg-slate-950 p-2"><span className="block text-slate-500 mb-1">Learning level</span><select value={selected.analysis.level} onChange={(event) => updateAnalysis({ level: event.target.value })} className="w-full bg-transparent font-semibold outline-none"><option value="undetermined">Choose level</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></label>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-2"><span className="block text-slate-500">Detection confidence</span><strong>{Math.round(selected.analysis.confidence * 100)}% heuristic</strong></div>
                </div>
                <div className="text-xs"><span className="text-slate-500">Suggested visuals: </span>{selected.analysis.recommendedVisualizations.join(' · ')}</div>
                {selected.analysis.warnings.map((warning) => <p key={warning} className="text-xs text-amber-700 dark:text-amber-300">• {warning}</p>)}
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Learning blueprint</h3><span className="text-[10px] text-slate-500">{sections.length} sections</span></div>
                {sections.map((section, index) => (
                  <div key={section.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{String(index + 1).padStart(2,'0')}</span>
                      <input aria-label={`Section ${index + 1} title`} value={section.title} onChange={(event) => updateSection(index, { title: event.target.value })} className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none"/>
                      <label className="flex items-center gap-1 text-[10px] text-slate-500"><input type="checkbox" checked={section.required} onChange={(event) => updateSection(index, { required: event.target.checked })}/> Required</label>
                    </div>
                    <p className="text-[11px] text-slate-500">{section.purpose}</p>
                    <span className="inline-flex rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] uppercase text-slate-500">{section.blockType}</span>
                  </div>
                ))}
                <button type="button" onClick={() => setSections((current) => [...current, { id: `custom-${Date.now()}`, title: 'New learning section', purpose: 'Describe the learning outcome for this section.', required: false, blockType: 'explanation' }])} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600"><Plus className="h-3.5 w-3.5"/> Add section</button>
                <button type="button" disabled={saving} onClick={() => void saveStructure()} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold disabled:opacity-50">{saving ? 'Saving…' : 'Save learning structure'}</button>
                <p className="text-[10px] text-slate-500">Generate sends this source and outline to the AI provider configured by your server. Output remains an unverified draft.</p>
                <button type="button" disabled={generating || saving} onClick={() => void generateLesson()} className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{generating ? 'Generating structured lesson…' : selected.generation?.status === 'generated' ? 'Regenerate lesson' : 'Generate learning content'}</button>
              </div>
              {selected.generatedLesson && (
                <div className="rounded-xl border border-sky-200 dark:border-sky-900 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-sm">{selected.generatedLesson.title}</h3><p className="text-[10px] text-slate-500">Generated by {selected.generation?.provider} · {selected.generation?.model}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${selected.publishedAt ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>{selected.publishedAt ? 'PUBLISHED' : 'UNVERIFIED DRAFT'}</span><button type="button" disabled={saving} onClick={() => void togglePublish()} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-[10px] font-semibold disabled:opacity-50">{saving ? 'Saving…' : selected.publishedAt ? 'Unpublish' : 'Publish lesson'}</button>{selected.publishedAt && <a href={`/?lesson=${encodeURIComponent(selected.id)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-sky-300 px-3 py-1.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">Open learner view</a>}</div></div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{selected.generatedLesson.summary}</p>
                  <div className="space-y-3">
                    {selected.generatedLesson.modules.map((module) => <article key={module.sectionId} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2"><h4 className="text-xs font-semibold">{module.title}</h4><pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300">{module.contentMarkdown}</pre>{module.keyPoints?.length > 0 && <ul className="list-disc pl-4 text-[11px] text-slate-500">{module.keyPoints.map((point, index) => <li key={index}>{point}</li>)}</ul>}{module.codeExamples?.map((example, index) => <div key={index} className="space-y-1"><span className="text-[10px] uppercase text-slate-500">{example.language}</span><pre className="overflow-x-auto rounded bg-slate-950 p-3 text-[11px] text-slate-100">{example.code}</pre><p className="text-[11px] text-slate-500">{example.explanation}</p></div>)}</article>)}
                  </div>
                  {selected.generatedLesson.visualizations?.length > 0 && <div className="space-y-3"><h4 className="text-xs font-semibold">Interactive diagrams and simulations</h4>{selected.generatedLesson.visualizations.map((visual) => <VisualizationRenderer key={visual.id} visual={visual}/>)}</div>}
                  <LearningRuntime jobId={selected.id} quiz={selected.generatedLesson.quiz || []} practiceTasks={selected.generatedLesson.practiceTasks || []}/>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">AI output is not fact-checked, code-executed or approved. Verify source claims, formulas, diagrams, code and quiz answers before publishing.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
              <FileText className="h-8 w-8 text-slate-400 mb-2"/>
              <p className="text-sm font-semibold">Your intelligence report will appear here</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Upload a text-based source to see detected domain, topic, difficulty, recommended visualizations and a subject-aware learning outline.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
