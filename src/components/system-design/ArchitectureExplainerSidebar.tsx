import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  BookOpen,
  Layers,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { CopyButton } from '../ui';

export type ArchitectureExplainFocus =
  | 'full-walkthrough'
  | 'data-flow'
  | 'failure-modes'
  | 'scaling-bottlenecks';

export interface ActiveArchitecturePayload {
  id: string;
  architectureTitle: string;
  sourceWorkspace: string;
  domain?: string;
  scaleContext?: string;
  summary: string;
  components: string[];
  connections: string[];
  mermaidDiagram?: string;
}

interface ArchitectureExplainerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  architecture: ActiveArchitecturePayload;
  requestTriggerCount: number;
}

const FOCUS_OPTIONS: Array<{
  id: ArchitectureExplainFocus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'full-walkthrough', label: 'Step-by-Step Logic', icon: BookOpen },
  { id: 'data-flow', label: 'Data & Storage', icon: Layers },
  { id: 'failure-modes', label: 'Failure Modes', icon: ShieldAlert },
  { id: 'scaling-bottlenecks', label: 'Scaling', icon: TrendingUp },
];

/**
 * Safely renders inline bold (**...**) and inline code (`...`) tokens as React elements.
 */
function renderInlineTokens(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-sky-700 dark:text-sky-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/**
 * Renders streamed Markdown walkthrough text into clean, structured editorial blocks
 * without using dangerouslySetInnerHTML.
 */
function WalkthroughMarkdownView({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      i += 1;
      continue;
    }

    // Section heading (## or ###)
    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      const headingText = line.replace(/^#{1,3}\s+/, '');
      const isSub = line.startsWith('### ');
      blocks.push(
        <h4
          key={`h-${i}`}
          className={
            isSub
              ? 'text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400 pt-2'
              : 'text-sm font-semibold text-slate-900 dark:text-slate-100 pt-3 first:pt-0 pb-1 border-b border-slate-200 dark:border-slate-800'
          }
        >
          {renderInlineTokens(headingText)}
        </h4>
      );
      i += 1;
      continue;
    }

    // Numbered logic step (`1. ...`) — collect any indented continuation lines
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const stepNum = numberedMatch[1];
      const stepLines = [numberedMatch[2]];
      let j = i + 1;
      while (j < lines.length) {
        const nextTrim = lines[j].trim();
        if (
          !nextTrim ||
          /^#{1,3}\s+/.test(nextTrim) ||
          /^\d+\.\s+/.test(nextTrim) ||
          /^[-*]\s+/.test(nextTrim)
        ) {
          break;
        }
        stepLines.push(nextTrim);
        j += 1;
      }

      blocks.push(
        <div
          key={`step-${i}`}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 flex gap-3"
        >
          <span className="shrink-0 w-6 h-6 rounded-md bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-mono font-bold tabular-nums flex items-center justify-center mt-0.5">
            {stepNum}
          </span>
          <p className="text-[13px] leading-6 text-slate-700 dark:text-slate-300">
            {renderInlineTokens(stepLines.join(' '))}
          </p>
        </div>
      );
      i = j;
      continue;
    }

    // Bullet item (`- ...` or `* ...`)
    if (/^[-*]\s+/.test(line)) {
      const bulletItems: string[] = [];
      let j = i;
      while (j < lines.length && /^[-*]\s+/.test(lines[j].trim())) {
        bulletItems.push(lines[j].trim().replace(/^[-*]\s+/, ''));
        j += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="space-y-2 pl-1">
          {bulletItems.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-[13px] leading-6 text-slate-700 dark:text-slate-300"
            >
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 shrink-0 mt-2.5"
              />
              <span>{renderInlineTokens(item)}</span>
            </li>
          ))}
        </ul>
      );
      i = j;
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-[13px] leading-6 text-slate-700 dark:text-slate-300">
        {renderInlineTokens(line)}
      </p>
    );
    i += 1;
  }

  return <div className="space-y-3">{blocks}</div>;
}

export const ArchitectureExplainerSidebar: React.FC<ArchitectureExplainerSidebarProps> = ({
  isOpen,
  onClose,
  architecture,
  requestTriggerCount,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [focus, setFocus] = useState<ArchitectureExplainFocus>('full-walkthrough');
  const [content, setContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [explainedTitle, setExplainedTitle] = useState<string>('');
  const [explainedId, setExplainedId] = useState<string>('');

  const abortRef = useRef<AbortController | null>(null);
  const scrollBodyRef = useRef<HTMLDivElement | null>(null);

  const generateWalkthrough = useCallback(
    async (targetArch: ActiveArchitecturePayload, targetFocus: ArchitectureExplainFocus) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);
      setError(null);
      setContent('');
      setExplainedTitle(targetArch.architectureTitle);
      setExplainedId(targetArch.id);

      try {
        const response = await fetch('/api/system-design/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            architectureTitle: targetArch.architectureTitle,
            sourceWorkspace: targetArch.sourceWorkspace,
            domain: targetArch.domain,
            scaleContext: targetArch.scaleContext,
            summary: targetArch.summary,
            components: targetArch.components,
            connections: targetArch.connections,
            mermaidDiagram: targetArch.mermaidDiagram,
            focus: targetFocus,
          }),
        });

        const contentType = response.headers.get('content-type') ?? '';
        if (!response.ok) {
          let errMsg = `Request failed (${response.status}).`;
          if (contentType.includes('application/json')) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            if (payload?.error) errMsg = payload.error;
          }
          throw new Error(errMsg);
        }

        if (!response.body) {
          throw new Error('Streaming response body was unavailable.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const rawEvent of events) {
            const dataLine = rawEvent
              .split('\n')
              .find((l) => l.startsWith('data: '));
            if (!dataLine) continue;
            const jsonPart = dataLine.slice(6).trim();
            if (!jsonPart) continue;

            try {
              const parsed = JSON.parse(jsonPart) as {
                type?: string;
                text?: string;
                error?: string;
              };
              if (parsed.type === 'delta' && typeof parsed.text === 'string') {
                setContent((prev) => prev + parsed.text);
              } else if (parsed.type === 'error') {
                setError(parsed.error || 'Walkthrough generation interrupted.');
              }
            } catch {
              // Ignore incomplete SSE fragment
            }
          }
        }
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to generate architecture explanation.'
        );
      } finally {
        if (abortRef.current === controller) {
          setIsStreaming(false);
        }
      }
    },
    []
  );

  // Trigger generation whenever the user clicks the header "Explain Architecture" button
  useEffect(() => {
    if (!isOpen || requestTriggerCount === 0) return;
    void generateWalkthrough(architecture, focus);
    // Intentionally keyed on requestTriggerCount so switching architectures while open prompts
    // cleanly via the sync banner rather than aborting a walkthrough mid-read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestTriggerCount]);

  // Abort in-flight stream on unmount or close
  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
      setIsStreaming(false);
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleChangeFocus = (nextFocus: ArchitectureExplainFocus) => {
    setFocus(nextFocus);
    void generateWalkthrough(architecture, nextFocus);
  };

  const selectionChanged =
    Boolean(explainedId) && explainedId !== architecture.id && !isStreaming;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="architecture-explainer-sidebar"
          role="complementary"
          aria-label="Architecture logic walkthrough sidebar"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 36 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed top-4 right-4 bottom-4 z-50 w-[min(470px,calc(100vw-2rem))] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Floating Sidebar Header */}
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0 bg-slate-50/80 dark:bg-slate-950/70">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
                <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Architecture Logic Walkthrough</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                {explainedTitle || architecture.architectureTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {architecture.sourceWorkspace}
                {architecture.scaleContext ? ` · ${architecture.scaleContext}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {content && <CopyButton text={content} label="Copy" />}
              <button
                type="button"
                onClick={() => void generateWalkthrough(architecture, focus)}
                disabled={isStreaming}
                title="Regenerate walkthrough"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                aria-label="Regenerate architecture walkthrough"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close architecture walkthrough sidebar"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Walkthrough Focus Lenses */}
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 shrink-0 bg-white dark:bg-slate-900">
            {FOCUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = focus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleChangeFocus(opt.id)}
                  disabled={isStreaming}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors disabled:opacity-60 ${
                    active
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3 h-3" aria-hidden="true" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Context Change Banner if User Selects Another Architecture While Reading */}
          {selectionChanged && (
            <div className="px-4 py-2.5 border-b border-sky-200 dark:border-sky-900 bg-sky-50/80 dark:bg-sky-950/40 flex items-center justify-between gap-2 shrink-0">
              <p className="text-xs text-sky-900 dark:text-sky-200 truncate">
                Selected: <span className="font-semibold">{architecture.architectureTitle}</span>
              </p>
              <button
                type="button"
                onClick={() => void generateWalkthrough(architecture, focus)}
                className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 transition-colors"
              >
                Explain This
              </button>
            </div>
          )}

          {/* Scrollable Walkthrough Content */}
          <div
            ref={scrollBodyRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {/* Architecture Scope Context Strip */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>ANALYZED TOPOLOGY</span>
                <span className="tabular-nums">
                  {architecture.components.length} components
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                {architecture.summary}
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 space-y-2">
                <div className="flex items-start gap-2 text-xs font-medium text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void generateWalkthrough(architecture, focus)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  Retry
                </button>
              </div>
            )}

            {isStreaming && !content && !error && (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2
                  className="w-6 h-6 text-sky-600 dark:text-sky-400 animate-spin"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Tracing end-to-end architecture logic...
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[280px]">
                    Generating step-by-step execution flow, storage paths, and failure guardrails for{' '}
                    {architecture.architectureTitle}.
                  </p>
                </div>
              </div>
            )}

            {content && <WalkthroughMarkdownView content={content} />}

            {isStreaming && content && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-sky-700 dark:text-sky-400 pt-1">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                <span>Streaming next step...</span>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
