export type ScratchpadTool = 'pen' | 'highlighter' | 'line' | 'eraser';

export type ScratchpadBackdrop = 'transparent' | 'grid' | 'whiteboard';

export interface Point2D {
  x: number;
  y: number;
}

export interface StrokeRecord {
  id: string;
  tool: ScratchpadTool;
  color: string;
  size: number;
  points: Point2D[];
}

export interface HistoryState {
  past: StrokeRecord[][];
  present: StrokeRecord[];
  future: StrokeRecord[][];
}

export function createInitialHistory(): HistoryState {
  return {
    past: [],
    present: [],
    future: [],
  };
}

export function pushStroke(state: HistoryState, stroke: StrokeRecord): HistoryState {
  if (stroke.points.length === 0) return state;
  return {
    past: [...state.past, state.present],
    present: [...state.present, stroke],
    future: [],
  };
}

export function undoStroke(state: HistoryState): HistoryState {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1];
  const newPast = state.past.slice(0, state.past.length - 1);
  return {
    past: newPast,
    present: previous,
    future: [state.present, ...state.future],
  };
}

export function redoStroke(state: HistoryState): HistoryState {
  if (state.future.length === 0) return state;
  const next = state.future[0];
  const newFuture = state.future.slice(1);
  return {
    past: [...state.past, state.present],
    present: next,
    future: newFuture,
  };
}

export function clearStrokes(state: HistoryState): HistoryState {
  if (state.present.length === 0) return state;
  return {
    past: [...state.past, state.present],
    present: [],
    future: [],
  };
}

/**
 * Generate a 2D coordinate axis stamp (horizontal and vertical lines with arrows)
 * centered at (cx, cy) with given half-span
 */
export function createCoordinateAxisStrokes(
  cx: number,
  cy: number,
  span = 110,
  color = '#475569'
): StrokeRecord[] {
  const now = Date.now();
  return [
    {
      id: `axis-x-${now}`,
      tool: 'line',
      color,
      size: 2,
      points: [
        { x: cx - span, y: cy },
        { x: cx + span, y: cy },
      ],
    },
    {
      id: `axis-y-${now}`,
      tool: 'line',
      color,
      size: 2,
      points: [
        { x: cx, y: cy + span },
        { x: cx, y: cy - span },
      ],
    },
  ];
}
