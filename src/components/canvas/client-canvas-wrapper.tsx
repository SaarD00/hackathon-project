"use client";

import dynamic from 'next/dynamic';

const ExcalidrawCanvas = dynamic(
  () => import('./excalidraw-canvas').then((mod) => mod.ExcalidrawCanvas),
  { ssr: false }
);

export function ClientCanvasWrapper() {
  return <ExcalidrawCanvas />;
}
