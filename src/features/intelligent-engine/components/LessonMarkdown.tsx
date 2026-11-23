import type { ReactNode } from 'react';

type InlineToken = { type: 'text' | 'code' | 'strong' | 'em' | 'link'; value: string; href?: string };

function tokenizeInline(source: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) tokens.push({ type: 'text', value: source.slice(cursor, index) });
    const raw = match[0];
    if (raw.startsWith('`')) tokens.push({ type: 'code', value: raw.slice(1, -1) });
    else if (raw.startsWith('**')) tokens.push({ type: 'strong', value: raw.slice(2, -2) });
    else if (raw.startsWith('*')) tokens.push({ type: 'em', value: raw.slice(1, -1) });
    else {
      const link = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) tokens.push({ type: 'link', value: link[1], href: link[2] });
    }
    cursor = index + raw.length;
  }
  if (cursor < source.length) tokens.push({ type: 'text', value: source.slice(cursor) });
  return tokens;
}

function safeHref(href: string): string | null {
  try {
    if (!/^https?:\/\//i.test(href)) return null;
    const parsed = new URL(href);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

function InlineMarkdown({ source }: { source: string }) {
  return <>{tokenizeInline(source).map((token, index) => {
    if (token.type === 'code') return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.92em] text-violet-700 dark:bg-slate-800 dark:text-violet-300">{token.value}</code>;
    if (token.type === 'strong') return <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">{token.value}</strong>;
    if (token.type === 'em') return <em key={index}>{token.value}</em>;
    if (token.type === 'link') {
      const href = token.href ? safeHref(token.href) : null;
      return href ? <a key={index} href={href} target="_blank" rel="noreferrer noopener" className="font-medium text-sky-700 underline underline-offset-2 dark:text-sky-300">{token.value}</a> : <span key={index}>{token.value}</span>;
    }
    return <span key={index}>{token.value}</span>;
  })}</>;
}

function isTableDivider(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function splitTableRow(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function renderBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }

    const fence = line.match(/^```([\w#+.-]*)$/);
    if (fence) {
      const language = fence[1] || 'text';
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !lines[index].trim().startsWith('```')) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<div key={blocks.length} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"><div className="border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{language}</div><pre className="overflow-x-auto p-4 text-xs leading-relaxed text-slate-100"><code>{code.join('\n')}</code></pre></div>);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const className = level === 1 ? 'text-xl font-bold' : level === 2 ? 'text-lg font-bold' : level === 3 ? 'text-base font-semibold' : 'text-sm font-semibold';
      const Tag: 'h2' | 'h3' | 'h4' | 'h5' = level === 1 ? 'h2' : level === 2 ? 'h3' : level === 3 ? 'h4' : 'h5';
      blocks.push(<Tag key={blocks.length} className={className}><InlineMarkdown source={heading[2]}/></Tag>);
      index += 1;
      continue;
    }

    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) quote.push(lines[index++].trim().replace(/^>\s?/, ''));
      blocks.push(<blockquote key={blocks.length} className="border-l-4 border-sky-300 bg-sky-50 px-4 py-3 text-sm text-slate-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-slate-300"><InlineMarkdown source={quote.join(' ')}/></blockquote>);
      continue;
    }

    if (line.startsWith('|') && index + 1 < lines.length && isTableDivider(lines[index + 1].trim())) {
      const headers = splitTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) rows.push(splitTableRow(lines[index++]));
      blocks.push(<div key={blocks.length} className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"><table className="w-full border-collapse text-left text-xs"><thead className="bg-slate-50 dark:bg-slate-800"><tr>{headers.map((cell, i) => <th key={i} className="border-b px-3 py-2 font-semibold">{<InlineMarkdown source={cell}/>}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b last:border-0">{headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2 align-top"><InlineMarkdown source={row[cellIndex] || ''}/></td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(lines[index])) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) items.push(lines[index++].replace(/^\s*[-*+]\s+/, ''));
      blocks.push(<ul key={blocks.length} className="list-disc space-y-1 pl-6 text-sm leading-7"><>{items.map((item, i) => <li key={i}><InlineMarkdown source={item}/></li>)}</></ul>);
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(lines[index])) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) items.push(lines[index++].replace(/^\s*\d+[.)]\s+/, ''));
      blocks.push(<ol key={blocks.length} className="list-decimal space-y-1 pl-6 text-sm leading-7">{items.map((item, i) => <li key={i}><InlineMarkdown source={item}/></li>)}</ol>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,4}\s|>\s?|\```|\||\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[index])) paragraph.push(lines[index++].trim());
    blocks.push(<p key={blocks.length} className="text-sm leading-7 text-slate-700 dark:text-slate-300"><InlineMarkdown source={paragraph.join(' ')}/></p>);
  }
  return blocks;
}

export function LessonMarkdown({ source }: { source: string }) {
  return <div className="space-y-4 break-words">{renderBlocks(source)}</div>;
}
