import type { ReactNode } from 'react';

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 text-[0.92em] dark:bg-slate-800">{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer noopener" className="text-sky-600 underline underline-offset-2">{link[1]}</a>;
    return part;
  });
}

/** Safe, dependency-free Markdown subset for published instructional content. Raw HTML is always rendered as text. */
export function LessonMarkdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<div key={blocks.length} className="my-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950"><div className="border-b border-slate-800 px-3 py-1.5 text-[10px] uppercase tracking-wide text-slate-400">{language || 'Code'}</div><pre className="overflow-x-auto p-4 text-xs leading-relaxed text-slate-100"><code>{code.join('\n')}</code></pre></div>);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const depth = heading[1].length;
      const Tag = (depth === 1 ? 'h2' : depth === 2 ? 'h3' : 'h4') as 'h2' | 'h3' | 'h4';
      blocks.push(<Tag key={blocks.length} className={depth === 1 ? 'mb-2 mt-6 text-lg font-bold text-slate-900 dark:text-slate-100' : depth === 2 ? 'mb-2 mt-5 text-base font-semibold text-slate-900 dark:text-slate-100' : 'mb-2 mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100'}>{renderInline(heading[2])}</Tag>);
      index += 1; continue;
    }
    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith('>')) quote.push(lines[index++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={blocks.length} className="my-3 border-l-4 border-sky-400 bg-sky-50 px-4 py-2 text-sm text-slate-700 dark:bg-sky-950/30 dark:text-slate-300">{quote.map((item, i) => <p key={i}>{renderInline(item)}</p>)}</blockquote>);
      continue;
    }
    if (index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      const cells = (value: string) => value.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
      const headers = cells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes('|')) rows.push(cells(lines[index++]));
      blocks.push(<div key={blocks.length} className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"><table className="w-full border-collapse text-left text-xs"><thead className="bg-slate-50 dark:bg-slate-800"><tr>{headers.map((cell, i) => <th key={i} className="border-b border-slate-200 px-3 py-2 font-semibold dark:border-slate-700">{renderInline(cell)}</th>)}</tr></thead><tbody>{rows.map((row, ri) => <tr key={ri}>{headers.map((_, ci) => <td key={ci} className="border-b border-slate-100 px-3 py-2 align-top dark:border-slate-800">{renderInline(row[ci] || '')}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    const listMatch = line.match(/^\s*([-*+] |\d+\. )(.*)$/);
    if (listMatch) {
      const ordered = /^\d/.test(line.trim());
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*+] |\d+\. )(.*)$/);
        if (!item || /^\d/.test(lines[index].trim()) !== ordered) break;
        items.push(item[2]); index += 1;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(<List key={blocks.length} className={ordered ? 'my-3 list-decimal space-y-1 pl-6 text-sm' : 'my-3 list-disc space-y-1 pl-6 text-sm'}>{items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}</List>);
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,4})\s|^```|^>|^\s*([-*+] |\d+\. )/.test(lines[index])) paragraph.push(lines[index++]);
    blocks.push(<p key={blocks.length} className="my-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">{renderInline(paragraph.join('\n'))}</p>);
  }
  return <div className="lesson-markdown min-w-0">{blocks}</div>;
}
