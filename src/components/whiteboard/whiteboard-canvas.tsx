'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface WhiteboardData {
  strokes: Stroke[];
}

const COLORS = ['#2b2c2c', '#c0392b', '#2980b9', '#27ae60'];

function drawStrokes(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, strokes: Stroke[]): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (const point of stroke.points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
}

export function WhiteboardCanvas({ modificationId, onClose }: { modificationId: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
      query: { modificationId },
    });
    socketRef.current = socket;

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('connecting'));
    socket.on('connect_error', () => setStatus('error'));
    socket.on('whiteboard:error', (payload: { message: string }) => {
      setStatus('error');
      setErrorMessage(payload.message);
    });
    socket.on('whiteboard:sync', (payload: { data: WhiteboardData | null }) => {
      strokesRef.current = payload.data?.strokes ?? [];
      redraw();
    });
    socket.on('whiteboard:update', (payload: { data: WhiteboardData }) => {
      strokesRef.current = payload.data.strokes;
      redraw();
    });

    return () => {
      socket.disconnect();
    };
     
  }, [modificationId]);

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawStrokes(ctx, canvas, strokesRef.current);
  }

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    currentStrokeRef.current = { points: [getPoint(event)], color, width: 2.5 };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!currentStrokeRef.current) return;
    currentStrokeRef.current.points.push(getPoint(event));
    redraw();
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) drawStrokes(ctx, canvasRef.current, [...strokesRef.current, currentStrokeRef.current]);
  }

  function handlePointerUp() {
    if (!currentStrokeRef.current) return;
    strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
    currentStrokeRef.current = null;
    redraw();
    socketRef.current?.emit('whiteboard:update', { data: { strokes: strokesRef.current } });
  }

  function handleClear() {
    strokesRef.current = [];
    redraw();
    socketRef.current?.emit('whiteboard:clear');
  }

  return (
    <div className="rounded-card-lg bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full ${color === c ? 'ring-2 ring-offset-1 ring-ink-900' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={`color ${c}`}
            />
          ))}
          <button onClick={handleClear} className="ml-2 text-[11px] text-ink-500 underline">
            Clear
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] text-ink-500">
            {status === 'connected' ? 'Live' : status === 'error' ? (errorMessage ?? 'Connection error') : 'Connecting…'}
          </span>
          <button onClick={onClose} className="text-[11px] text-ink-500 underline">
            Close
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="mt-3 w-full touch-none rounded-control border border-dashed border-warm-500 bg-warm-50"
      />
    </div>
  );
}
