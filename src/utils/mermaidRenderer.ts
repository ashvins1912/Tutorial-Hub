import mermaid from 'mermaid';

export interface RenderMermaidOptions {
  idPrefix: string;
  isDark: boolean;
  maxHeight?: string;
  flowchartPadding?: number;
}

// Serialize all Mermaid renders because mermaid v12 mutates global config and temporary DOM nodes.
let renderQueue: Promise<unknown> = Promise.resolve();
let renderSeq = 0;

/**
 * Normalize Mermaid source before rendering.
 * Keeps `<br/>` intact inside flowchart labels (Mermaid splits `<br/>` into SVG `<tspan>` lines
 * without breaking single-line edge label syntax), while normalizing bare `<br>` to `<br/>`.
 */
export function normalizeMermaidSource(rawCode: string): string {
  const trimmed = rawCode.trim();
  if (!trimmed) return '';
  return trimmed.replace(/<br\s*\/?>/gi, '<br/>');
}

/**
 * Make HTML5-serialized SVG from Mermaid/DOMPurify XML-friendlier before strict XML parsing.
 */
function makeSvgXmlFriendly(svgMarkup: string): string {
  return svgMarkup
    .replace(/<br(?:\s+[^>]*)?>/gi, '<br/>')
    .replace(/<hr(?:\s+[^>]*)?>/gi, '<hr/>')
    .replace(/&nbsp;/gi, '&#160;');
}

/**
 * Defensively strip executable elements, event handler attributes, and unsafe URI schemes
 * from a detached SVG DOM tree prior to importing into the live document.
 */
function sanitizeSvgTree(svgEl: SVGSVGElement): void {
  const forbiddenTags = new Set(['script', 'iframe', 'object', 'embed', 'link']);
  const toRemove: Element[] = [];

  const walk = (el: Element) => {
    const tag = el.tagName.toLowerCase();
    if (forbiddenTags.has(tag)) {
      toRemove.push(el);
      return;
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (
        (name === 'href' || name === 'xlink:href' || name === 'src') &&
        (value.startsWith('javascript:') ||
          value.startsWith('vbscript:') ||
          value.startsWith('data:text/html'))
      ) {
        el.removeAttribute(attr.name);
      }
    }

    for (const child of Array.from(el.children)) {
      walk(child);
    }
  };

  walk(svgEl);
  for (const bad of toRemove) {
    bad.remove();
  }
}

/**
 * Parse a Mermaid-generated SVG string into a real, sanitized `SVGSVGElement`.
 * Attempt 1 uses strict XML (`image/svg+xml`) after normalizing void tags & `&nbsp;`.
 * Attempt 2 safely falls back to the inert HTML5 DOMParser (`text/html`), which natively
 * handles Mermaid v12 / DOMPurify HTML5-serialized SVG (`<foreignObject>`, `<br>`, `<style>`).
 */
export function parseMermaidSvg(svgMarkup: string): SVGSVGElement {
  const trimmed = svgMarkup.trim();
  if (!trimmed) {
    throw new Error('Mermaid renderer returned empty SVG output.');
  }

  const parser = new DOMParser();

  // Attempt 1: Strict XML/SVG parsing on XML-normalized SVG markup
  const xmlDoc = parser.parseFromString(makeSvgXmlFriendly(trimmed), 'image/svg+xml');
  const xmlRoot = xmlDoc.documentElement;
  const hasXmlParseError =
    !xmlRoot ||
    xmlRoot.nodeName.toLowerCase() !== 'svg' ||
    Boolean(xmlDoc.querySelector('parsererror'));

  let svgEl: SVGSVGElement | null = null;

  if (!hasXmlParseError) {
    svgEl = xmlRoot as unknown as SVGSVGElement;
  } else {
    // Attempt 2: Inert HTML5 parsing (scripts never execute and external resources never load)
    const htmlDoc = parser.parseFromString(trimmed, 'text/html');
    const found = htmlDoc.body.querySelector('svg') ?? htmlDoc.querySelector('svg');
    if (found && found.nodeName.toLowerCase() === 'svg') {
      svgEl = found as unknown as SVGSVGElement;
    }
  }

  if (!svgEl) {
    throw new Error('Unable to parse Mermaid diagram SVG.');
  }

  // Detect Mermaid's built-in syntax error SVG so callers show a clean message instead of an error graphic
  const roleDesc = svgEl.getAttribute('aria-roledescription')?.toLowerCase() ?? '';
  if (roleDesc === 'error') {
    const errText = svgEl.textContent?.trim() || 'Mermaid diagram syntax error.';
    throw new Error(errText);
  }

  if (!svgEl.getAttribute('xmlns')) {
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  sanitizeSvgTree(svgEl);

  return document.importNode(svgEl, true) as SVGSVGElement;
}

/**
 * Render Mermaid syntax into a sanitized, responsive, live-DOM-ready `SVGSVGElement`
 * through a serialized queue so concurrent diagram mounts never race on global Mermaid state.
 */
export function renderMermaidToSvgElement(
  rawCode: string,
  options: RenderMermaidOptions
): Promise<SVGSVGElement> {
  const task = async (): Promise<SVGSVGElement> => {
    const normalizedCode = normalizeMermaidSource(rawCode);
    if (!normalizedCode) {
      throw new Error('Mermaid diagram source is empty.');
    }

    const safePrefix = options.idPrefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'diagram';
    const renderId = `mmd_${safePrefix}_${++renderSeq}`;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: options.isDark ? 'dark' : 'neutral',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: false,
        curve: 'basis',
        ...(options.flowchartPadding !== undefined ? { padding: options.flowchartPadding } : {}),
      },
      sequence: {
        useMaxWidth: true,
        showSequenceNumbers: true,
      },
      er: {
        useMaxWidth: true,
      },
    });

    try {
      const { svg } = await mermaid.render(renderId, normalizedCode);
      const importedSvg = parseMermaidSvg(svg);
      importedSvg.style.width = '100%';
      importedSvg.style.height = 'auto';
      if (options.maxHeight) {
        importedSvg.style.maxHeight = options.maxHeight;
      }
      return importedSvg;
    } finally {
      // Clean up any stray offscreen render container left behind by Mermaid in document.body
      if (typeof document !== 'undefined') {
        document.getElementById(`d${renderId}`)?.remove();
      }
    }
  };

  const result = renderQueue.then(task, task);
  renderQueue = result.catch(() => undefined);
  return result;
}
