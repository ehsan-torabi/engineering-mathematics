'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  Highlighter,
  Eraser,
  Minus,
  Undo2,
  Redo2,
  Trash2,
  Download,
  X,
  Grid,
  MousePointerClick,
  PlusSquare,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import {
  ScratchpadTool,
  ScratchpadBackdrop,
  Point2D,
  StrokeRecord,
  createInitialHistory,
  pushStroke,
  undoStroke,
  redoStroke,
  clearStrokes,
  createCoordinateAxisStrokes,
} from '@/lib/scratchpad-utils';

interface InteractiveScratchpadProps {
  externalOpen?: boolean;
  onExternalToggle?: (open: boolean) => void;
}

const INK_COLORS = [
  { id: 'slate', value: '#0F172A', label: 'مشکی' },
  { id: 'blue', value: '#0284C7', label: 'آبی مهندسی' },
  { id: 'red', value: '#DC2626', label: 'قرمز' },
  { id: 'emerald', value: '#059669', label: 'سبز' },
  { id: 'amber', value: '#D97706', label: 'نارنجی' },
];

const STROKE_SIZES = [
  { size: 2.5, label: 'ظریف' },
  { size: 4.5, label: 'متوسط' },
  { size: 8, label: 'ضخیم' },
];

export default function InteractiveScratchpad({
  externalOpen,
  onExternalToggle,
}: InteractiveScratchpadProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onExternalToggle?.(next);
  };

  const [tool, setTool] = useState<ScratchpadTool>('pen');
  const [color, setColor] = useState<string>('#0284C7');
  const [strokeSize, setStrokeSize] = useState<number>(2.5);
  const [backdrop, setBackdrop] = useState<ScratchpadBackdrop>('transparent');
  const [passThroughMode, setPassThroughMode] = useState<boolean>(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState<boolean>(false);
  const [history, setHistory] = useState(createInitialHistory);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStrokeRef = useRef<StrokeRecord | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Render a single stroke onto a 2D canvas context
  const drawStrokeOnCtx = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: StrokeRecord) => {
      if (stroke.points.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = stroke.size * 5;
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = stroke.size * 4.5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1;
        ctx.lineWidth = stroke.size;
      }

      const pts = stroke.points;
      ctx.beginPath();

      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle =
          stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color;
        ctx.fill();
      } else if (stroke.tool === 'line') {
        const first = pts[0];
        const last = pts[pts.length - 1];
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }

      ctx.restore();
    },
    []
  );

  // Full redraw of canvas including optional grid/whiteboard backdrop and all committed + active strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Draw all committed strokes first
    for (const st of history.present) {
      drawStrokeOnCtx(ctx, st);
    }

    // Draw currently active stroke
    if (activeStrokeRef.current) {
      drawStrokeOnCtx(ctx, activeStrokeRef.current);
    }

    ctx.restore();
  }, [history.present, drawStrokeOnCtx]);

  // Resize canvas to match viewport size with devicePixelRatio sharpness
  useEffect(() => {
    if (!isOpen) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      redrawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isOpen, redrawCanvas]);

  useEffect(() => {
    if (isOpen) {
      redrawCanvas();
    }
  }, [isOpen, history.present, backdrop, redrawCanvas]);

  const getPointerPoint = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): Point2D => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (passThroughMode) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = getPointerPoint(e);
    isDrawingRef.current = true;
    activeStrokeRef.current = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tool,
      color,
      size: strokeSize,
      points: [pt],
    };
    redrawCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeStrokeRef.current || passThroughMode)
      return;
    e.preventDefault();
    const pt = getPointerPoint(e);

    if (tool === 'line') {
      activeStrokeRef.current.points = [
        activeStrokeRef.current.points[0],
        pt,
      ];
    } else {
      activeStrokeRef.current.points.push(pt);
    }
    redrawCanvas();
  };

  const finishStroke = () => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const finished = activeStrokeRef.current;
    isDrawingRef.current = false;
    activeStrokeRef.current = null;
    setHistory((prev) => pushStroke(prev, finished));
  };

  const handleStampAxes = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const axisStrokes = createCoordinateAxisStrokes(cx, cy, 120, '#334155');
    setHistory((prev) => {
      let next = prev;
      for (const st of axisStrokes) {
        next = pushStroke(next, st);
      }
      return next;
    });
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an export canvas with white background so exported notes are legible anywhere
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const eCtx = exportCanvas.getContext('2d');
    if (!eCtx) return;

    eCtx.fillStyle = '#FFFFFF';
    eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    eCtx.drawImage(canvas, 0, 0);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `math-scratchpad-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <>
      {/* Floating Launcher Button (always accessible at bottom-left, offset from dev badge) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-16 z-40 flex items-center gap-2 rounded-xl border border-[#0284C7] bg-[#0284C7] px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#0369A1]"
          aria-label="باز کردن تخته یادداشت و حل دستی (Scratchpad)"
        >
          <PenTool className="h-4 w-4" />
          <span>تخته یادداشت و حل دستی (Scratchpad)</span>
          {history.present.length > 0 && (
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">
              {history.present.length}
            </span>
          )}
        </button>
      )}

      {/* Active Floating Overlay & Canvas */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 ${
            passThroughMode ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          role="region"
          aria-label="تخته یادداشت و حل دستی ریاضیات"
        >
          {/* Optional Backdrop Layer */}
          <div
            className={`absolute inset-0 transition-colors ${
              backdrop === 'whiteboard'
                ? 'bg-[#F8FAFC]/95'
                : backdrop === 'grid'
                ? 'bg-[#F8FAFC]/75'
                : 'bg-transparent'
            }`}
            style={
              backdrop === 'grid' || backdrop === 'whiteboard'
                ? {
                    backgroundImage:
                      'linear-gradient(to right, rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }
                : undefined
            }
          />

          {/* Drawing HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
            className={`relative z-10 block h-full w-full touch-none ${
              passThroughMode
                ? 'pointer-events-none cursor-default'
                : tool === 'eraser'
                ? 'cursor-cell'
                : 'cursor-crosshair'
            }`}
          />

          {/* Floating Control Dock (Always interactive even when passThroughMode is true) */}
          <div className="pointer-events-auto fixed bottom-5 left-1/2 z-50 w-[95vw] max-w-4xl -translate-x-1/2 rounded-2xl border border-[#CBD5E1] bg-white/95 p-3 shadow-xl backdrop-blur-md">
            {/* Top Status & Collapse Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0284C7] text-white">
                  <PenTool className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="text-xs font-bold text-[#0F172A]">
                    تخته یادداشت تعاملی (Interactive Scratchpad)
                  </span>
                  <span className="mr-2 hidden text-[11px] text-[#64748B] sm:inline">
                    • با ماوس یا قلم لمسی روابط و مشتقات را مستقیماً روی صفحه بنویسید
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Toggle between Drawing and Interacting with underlying UI */}
                <button
                  type="button"
                  onClick={() => setPassThroughMode((p) => !p)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                    passThroughMode
                      ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46]'
                      : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:bg-[#F1F5F9]'
                  }`}
                  title="در حالت تعامل با صفحه، دست‌خط شما باقی می‌ماند اما می‌توانید اسلایدرها و دکمه‌های زیر صفحه را تغییر دهید"
                >
                  <MousePointerClick className="h-3.5 w-3.5" />
                  {passThroughMode
                    ? 'حالت تعامل با صفحه زیرین (فعال)'
                    : 'تعامل با صفحه زیرین'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsToolbarCollapsed((c) => !c)}
                  className="rounded-lg border border-[#CBD5E1] bg-white p-1.5 text-[#475569] hover:bg-[#F1F5F9]"
                  title={isToolbarCollapsed ? 'باز کردن ابزارها' : 'کوچک کردن نوار ابزار'}
                  aria-label="تغییر اندازه نوار ابزار"
                >
                  {isToolbarCollapsed ? (
                    <Maximize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Minimize2 className="h-3.5 w-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1 rounded-lg border border-[#DC2626]/30 bg-[#FEF2F2] px-2.5 py-1 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2]"
                  aria-label="بستن تخته یادداشت"
                >
                  <X className="h-3.5 w-3.5" />
                  بستن
                </button>
              </div>
            </div>

            {!isToolbarCollapsed && (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                {/* Tool Selection */}
                <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
                  {[
                    { id: 'pen', label: 'قلم', icon: PenTool },
                    { id: 'highlighter', label: 'هایلایت', icon: Highlighter },
                    { id: 'line', label: 'خط‌کش', icon: Minus },
                    { id: 'eraser', label: 'پاک‌کن', icon: Eraser },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = tool === item.id && !passThroughMode;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setPassThroughMode(false);
                          setTool(item.id as ScratchpadTool);
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                          active
                            ? 'bg-[#0284C7] text-white shadow-2xs'
                            : 'text-[#475569] hover:bg-white hover:text-[#0F172A]'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleStampAxes}
                    className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#334155] hover:border-[#0284C7] hover:text-[#0284C7]"
                    title="درج محور مختصات (x,y) در مرکز صفحه"
                  >
                    <PlusSquare className="h-3.5 w-3.5" />
                    محور (x,y)
                  </button>
                </div>

                {/* Color & Stroke Thickness */}
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="flex items-center gap-1.5"
                    role="group"
                    aria-label="رنگ قلم"
                  >
                    {INK_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setPassThroughMode(false);
                          if (tool === 'eraser') setTool('pen');
                          setColor(c.value);
                        }}
                        className={`h-6 w-6 rounded-full border-2 transition-transform ${
                          color === c.value && tool !== 'eraser'
                            ? 'scale-110 border-[#0F172A] ring-2 ring-[#0284C7]/40'
                            : 'border-white shadow-2xs'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                        aria-label={c.label}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1">
                    {STROKE_SIZES.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setStrokeSize(s.size)}
                        className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                          strokeSize === s.size
                            ? 'bg-[#0F172A] text-white'
                            : 'text-[#475569] hover:bg-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Backdrop Mode & History Controls */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1">
                    {[
                      { id: 'transparent', label: 'شفاف' },
                      { id: 'grid', label: 'شطرنجی' },
                      { id: 'whiteboard', label: 'تخته سفید' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setBackdrop(b.id as ScratchpadBackdrop)
                        }
                        className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold transition ${
                          backdrop === b.id
                            ? 'bg-[#0284C7] text-white'
                            : 'text-[#475569] hover:bg-white'
                        }`}
                      >
                        {b.id === 'grid' && <Grid className="h-3 w-3" />}
                        {b.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={history.past.length === 0}
                    onClick={() => setHistory((prev) => undoStroke(prev))}
                    className="rounded-lg border border-[#CBD5E1] bg-white p-1.5 text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40"
                    title="بازگشت (Undo)"
                    aria-label="بازگشت (Undo)"
                  >
                    <Undo2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={history.future.length === 0}
                    onClick={() => setHistory((prev) => redoStroke(prev))}
                    className="rounded-lg border border-[#CBD5E1] bg-white p-1.5 text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40"
                    title="انجام مجدد (Redo)"
                    aria-label="انجام مجدد (Redo)"
                  >
                    <Redo2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={history.present.length === 0}
                    onClick={() => setHistory((prev) => clearStrokes(prev))}
                    className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-40"
                    title="پاک کردن کل صفحه"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    پاک‌سازی
                  </button>

                  <button
                    type="button"
                    disabled={history.present.length === 0}
                    onClick={handleDownloadImage}
                    className="flex items-center gap-1 rounded-lg border border-[#0284C7]/30 bg-[#F0F9FF] px-2.5 py-1.5 text-xs font-bold text-[#0369A1] hover:bg-[#E0F2FE] disabled:opacity-40"
                    title="ذخیره یادداشت‌ها به صورت تصویر PNG"
                  >
                    <Download className="h-3.5 w-3.5" />
                    ذخیره تصویر
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
