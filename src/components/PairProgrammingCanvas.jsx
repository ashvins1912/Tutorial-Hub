import { useEffect, useRef, useState } from 'react';
import { Eraser, MousePointer2, PenTool } from 'lucide-react';

export function PairProgrammingCanvas({
  active,
  drawMode,
  onToggleDrawMode,
  localUser,
  remoteUsers,
  strokes,
  onAddStroke,
  onClearStrokes,
  onMoveCursor,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef([]);
  const lastCursorSentRef = useRef(0);

  const [penColor, setPenColor] = useState(localUser?.color || '#0284c7');

  // Keep penColor synced if localUser changes
  useEffect(() => {
    if (localUser?.color) setPenColor(localUser.color);
  }, [localUser?.color]);

  // Redraw all server-synced strokes + live local stroke onto responsive <canvas>
  const redrawCanvas = (previewPoints = null) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(1, Math.floor(rect.width * dpr));
    const targetH = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const drawStroke = (pts, color, width) => {
      if (!pts || pts.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(pts[0].x * rect.width, pts[0].y * rect.height);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * rect.width, pts[i].y * rect.height);
      }
      ctx.stroke();
    };

    for (const s of strokes) {
      drawStroke(s.points, s.color, s.width || 2.5);
    }

    if (previewPoints && previewPoints.length > 1) {
      drawStroke(previewPoints, penColor, 2.5);
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [strokes, active]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => redrawCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, strokes]);

  if (!active) return null;

  const getNormalizedPoint = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerMove = (e) => {
    const pt = getNormalizedPoint(e);
    if (!pt) return;

    const now = Date.now();
    if (now - lastCursorSentRef.current > 35) {
      lastCursorSentRef.current = now;
      onMoveCursor?.(pt);
    }

    if (drawMode && isDrawingRef.current) {
      currentPointsRef.current.push(pt);
      redrawCanvas(currentPointsRef.current);
    }
  };

  const handlePointerDown = (e) => {
    if (!drawMode) return;
    const pt = getNormalizedPoint(e);
    if (!pt) return;
    isDrawingRef.current = true;
    currentPointsRef.current = [pt];
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pts = currentPointsRef.current;
    currentPointsRef.current = [];
    if (pts.length >= 2) {
      onAddStroke?.({
        id: `${localUser.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: localUser.userId,
        color: penColor,
        width: 2.5,
        points: pts,
      });
    } else {
      redrawCanvas();
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={finishStroke}
      onPointerLeave={() => {
        finishStroke();
        onMoveCursor?.(null);
      }}
      className={`absolute inset-0 z-20 ${
        drawMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Shared WebSocket Sketch Layer */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Remote Live Cursors */}
      {remoteUsers.map((user) =>
        user.cursor ? (
          <div
            key={user.userId}
            className="pointer-events-none absolute -translate-x-1 -translate-y-1 transition-all duration-75 z-30"
            style={{
              left: `${user.cursor.x * 100}%`,
              top: `${user.cursor.y * 100}%`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M1 1L6.5 14L8.8 8.8L14 6.5L1 1Z"
                fill={user.color}
                stroke="white"
                strokeWidth="1.2"
              />
            </svg>
            <div
              className="mt-0.5 ml-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-white whitespace-nowrap shadow-sm"
              style={{ backgroundColor: user.color }}
            >
              {user.name} (Remote)
            </div>
          </div>
        ) : null
      )}

      {/* Floating Overlay Controls */}
      <div className="pointer-events-auto absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-sm text-xs">
        <button
          type="button"
          onClick={() => onToggleDrawMode?.(false)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
            !drawMode
              ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <MousePointer2 className="w-3 h-3" aria-hidden="true" />
          Dry-Run Click
        </button>

        <button
          type="button"
          onClick={() => onToggleDrawMode?.(true)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
            drawMode
              ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <PenTool className="w-3 h-3" aria-hidden="true" />
          Sketch Pointer
        </button>

        {['#0284c7', '#10b981', '#f59e0b', '#e11d48'].map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Select pen color ${c}`}
            onClick={() => {
              setPenColor(c);
              onToggleDrawMode?.(true);
            }}
            className={`w-4 h-4 rounded-sm border ${
              penColor === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}

        <button
          type="button"
          onClick={onClearStrokes}
          aria-label="Clear shared sketch strokes"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Eraser className="w-3 h-3" aria-hidden="true" />
          Clear
        </button>
      </div>
    </div>
  );
}
