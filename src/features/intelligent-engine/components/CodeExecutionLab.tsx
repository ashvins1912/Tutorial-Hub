import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/apiFetch';

type Language = 'java' | 'javascript' | 'python';
type ExecutionResult = { status: string; statusId: number; stdout: string; stderr: string; compileOutput: string; time: string | null; memory: number | null };
const STARTERS: Record<Language, string> = {
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java");\n  }\n}',
  javascript: 'const message = "Hello from JavaScript";\nconsole.log(message);',
  python: 'message = "Hello from Python"\nprint(message)',
};

export function CodeExecutionLab() {
  const [language, setLanguage] = useState<Language>('java');
  const [sourceCode, setSourceCode] = useState(STARTERS.java);
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [executionAvailable, setExecutionAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ExecutionResult | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch('/api/code-execution/status')
      .then(async (response) => {
        if (!response.ok) throw new Error('Execution service status is unavailable.');
        const payload = await response.json() as { available?: boolean };
        if (active) setExecutionAvailable(Boolean(payload.available));
      })
      .catch(() => { if (active) setExecutionAvailable(false); });
    return () => { active = false; };
  }, []);

  const run = async () => {
    setRunning(true); setError(''); setResult(null);
    try {
      const response = await apiFetch('/api/code-execution/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, sourceCode, stdin }),
      });
      const payload = await response.json() as { result?: ExecutionResult; message?: string; code?: string };
      if (!response.ok) throw new Error(payload.message || payload.code || 'Code execution failed.');
      if (!payload.result) throw new Error('Execution provider returned an invalid response.');
      setResult(payload.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code execution failed.');
    } finally { setRunning(false); }
  };

  return <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-sm font-semibold">Secure code execution lab</h4><p className="text-[11px] text-slate-500">Java · JavaScript · Python · editor and examples</p></div><span className={`rounded-full px-2 py-1 text-[10px] ${executionAvailable ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>{executionAvailable === null ? 'Checking execution status…' : executionAvailable ? 'Execution available' : 'Unavailable on Render Free'}</span></div>
    <label className="block text-[11px] text-slate-500">Language<select value={language} onChange={(event) => { const next = event.target.value as Language; setLanguage(next); setSourceCode(STARTERS[next]); setResult(null); }} className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-2 text-xs text-slate-900 dark:text-slate-100"><option value="java">Java 21</option><option value="javascript">JavaScript (Node.js)</option><option value="python">Python 3</option></select></label>
    <label className="block text-[11px] text-slate-500">Source code<textarea spellCheck={false} value={sourceCode} onChange={(event) => setSourceCode(event.target.value)} rows={12} maxLength={20000} className="mt-1 w-full resize-y rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-100" /></label>
    <label className="block text-[11px] text-slate-500">Standard input (stdin)<textarea value={stdin} onChange={(event) => setStdin(event.target.value)} rows={3} maxLength={5000} placeholder="Optional input for your program" className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-2 font-mono text-xs text-slate-900 dark:text-slate-100"/></label>
    <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={running || !sourceCode.trim() || executionAvailable !== true} onClick={() => void run()} className="rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-40">{running ? 'Checking sandbox…' : 'Run code'}</button><span className="text-[10px] text-slate-500">20 KB code · 5 KB stdin · 8 runs/minute</span></div>
    {!executionAvailable && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Secure execution is intentionally disabled on Render Free. You can still edit and study the examples; no submitted code will be run.</p>}
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
    {result && <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs">{result.status}</strong><span className="text-[10px] text-slate-500">{result.time ? result.time + ' s' : ''}{result.memory !== null ? ' · ' + result.memory + ' KB' : ''}</span></div>{result.stdout && <div><span className="text-[10px] font-semibold text-slate-500">OUTPUT</span><pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs text-emerald-300">{result.stdout}</pre></div>}{result.compileOutput && <div><span className="text-[10px] font-semibold text-amber-600">COMPILER OUTPUT</span><pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs text-amber-200">{result.compileOutput}</pre></div>}{result.stderr && <div><span className="text-[10px] font-semibold text-rose-600">STDERR</span><pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs text-rose-300">{result.stderr}</pre></div>}</div>}
    <p className="text-[10px] text-slate-500">The editor remains available for reading and writing examples. Running arbitrary code is disabled because Render Free does not provide a verified sandbox isolation boundary. Your source is not sent to an external execution provider.</p>
  </section>;
}
