"use client";

import { downloadBlob, generateFrameSnapshot } from "@/lib/frame-snapshot";
import {
  addArrow,
  addEllipse,
  addFrame,
  addFreeDrawShape,
  addGeneratedUI,
  addLine,
  addRect,
  addText,
  clearSelection,
  FrameShape,
  removeShape,
  selectShape,
  setTool,
  Shape,
  Tool,
  updateShape,
} from "@/redux/slice/shapes";
import {
  handToolDisable,
  handToolEnable,
  panEnd,
  panMove,
  panStart,
  Point,
  screenToWorld,
  wheelPan,
  wheelZoom,
} from "@/redux/slice/viewport";
import { AppDispatch, useAppDispatch, useAppSelector } from "@/redux/store";
import { nanoid } from "@reduxjs/toolkit";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

interface TouchPointer {
  id: number;
  p: Point;
}

interface DraftShape {
  type: "frame" | "rect" | "ellipse" | "arrow" | "line";
  startWorld: Point;
  currentWorld: Point;
}

const RAF_INTERVAL_MS = 8;
type WithClientXY = { clientX: number; clientY: number };

export const useCanvas = () => {
  const dispatch = useDispatch<AppDispatch>();
  const viewport = useAppSelector((state) => state.viewport);
  const state = useAppSelector((state) => state.shapes.shapes);

  const shapeList: Shape[] = state.ids
    .map((id: string) => state.entities[id])
    .filter((s: Shape | undefined): s is Shape => Boolean(s));

  const currentTool = useAppSelector((s) => s.shapes.tool);
  const selectedShapes = useAppSelector((s) => s.shapes.selected);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const shapesEntities = useAppSelector(
    (state) => state.shapes.shapes.entities,
  );

  const hasSelectedText = Object.keys(selectedShapes).some((id) => {
    const shape = shapesEntities[id as keyof typeof shapesEntities];
    return shape?.type === "text";
  });

  useEffect(() => {
    if (hasSelectedText) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [hasSelectedText]);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const touchRef = useRef<Map<Number, TouchPointer>>(new Map());
  const draftShapeRef = useRef<DraftShape | null>(null);
  const freeDrawRef = useRef<Point[] | null>([]);

  const isSpacePressed = useRef(false);
  const isDrawingRef = useRef(false);
  const isResizingRef = useRef(false);
  const isMovingRef = useRef(false);
  const mouseStartRef = useRef<Point | null>(null);
  const isErasingRef = useRef(false);
  const erasedShapesRef = useRef<Set<string>>(new Set());

  const initialShapePositionsRef = useRef<
    Record<
      string,
      {
        x?: number;
        y?: number;
        startX?: number;
        startY?: number;
        endX?: number;
        endY?: number;
        points?: Point[];
      }
    >
  >({});

  const resizeDataRef = useRef<{
    shapeId: string;
    corner: string;
    initialBounds: { x: number; y: number; width: number; height: number };
    startPoint: { x: number; y: number };
  } | null>(null);

  const lastFreehandFrameRef = useRef(0);
  const freehandRafRef = useRef<number | null>(null);
  const panRafRef = useRef<number | null>(null);
  const pendingPanPointRef = useRef<Point | null>(null);

  const [, force] = useState(0);
  const requestRender = (): void => {
    force((n) => (n + 1) | 0);
  };

  const localPointFromClient = (clientX: number, clientY: number): Point => {
    const el = canvasRef.current;
    if (!el) return { x: clientX, y: clientY };
    const r = el.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const blurActiveTextInput = () => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === "INPUT") {
      (activeElement as HTMLInputElement).blur();
    }
  };

  const getLocalPointFromPointer = (e: WithClientXY): Point =>
    localPointFromClient(e.clientX, e.clientY);

  const getShapeAtPoint = (worldPoint: Point): Shape | null => {
    for (let i = shapeList.length - 1; i >= 0; i--) {
      const shape = shapeList[i];
      if (isPointInShape(worldPoint, shape)) {
        return shape;
      }
    }
    return null;
  };

  const isPointInShape = (point: Point, shape: any): boolean => {
    const width = typeof shape.w === "number" ? shape.w : shape.width || 0;
    const height = typeof shape.h === "number" ? shape.h : shape.height || 0;
    switch (shape.type) {
      case "frame":
      case "rect":
      case "ellipse":
      case "generatedui":
        return (
          point.x >= shape.x &&
          point.x <= shape.x + shape.w &&
          point.y >= shape.y &&
          point.y <= shape.y + shape.h
        );
      case "freedraw":
        const threshold = 8;
        for (let i = 0; i < shape.points.length - 1; i++) {
          const p1 = shape.points[i];
          const p2 = shape.points[i + 1];
          if (distancePointToSegment(point, p1, p2) <= threshold) {
            return true;
          }
        }
        return false;
      case "arrow":
      case "line":
        const thresholdLine = 5;
        return (
          distancePointToSegment(
            point,
            { x: shape.startX, y: shape.startY },
            { x: shape.endX, y: shape.endY },
          ) <= thresholdLine
        );
      case "text":
        const textWidth = Math.max(
          shape.text.length * (shape.fontSize * 0.6),
          100,
        );
        const textHeight = shape.fontSize * 1.2;
        const padding = 8;
        return (
          point.x >= shape.x - 2 &&
          point.x <= shape.x + textWidth + padding + 2 &&
          point.y >= shape.y - 2 &&
          point.y <= shape.y + textHeight + padding + 2
        );
      default:
        return false;
    }
  };

  const distancePointToSegment = (p: Point, v: Point, w: Point): number => {
    const a = p.x - v.x;
    const b = p.y - v.y;
    const c = w.x - v.x;
    const d = w.y - v.y;

    const dot = a * c + b * d;
    const lenSq = c ** 2 + d ** 2;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = v.x;
      yy = v.y;
    } else if (param > 1) {
      xx = w.x;
      yy = w.y;
    } else {
      xx = v.x + param * c;
      yy = v.y + param * d;
    }

    const dx = p.x - xx;
    const dy = p.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const schedulePanMove = (p: Point) => {
    pendingPanPointRef.current = p;
    if (panRafRef.current !== null) return;
    panRafRef.current = window.requestAnimationFrame(() => {
      panRafRef.current = null;
      const next = pendingPanPointRef.current;
      if (next) dispatch(panMove(next));
    });
  };

  const freehandTick = (): void => {
    const now = performance.now();
    if (now - lastFreehandFrameRef.current >= RAF_INTERVAL_MS) {
      if (freeDrawRef.current && freeDrawRef.current.length > 0)
        requestRender();
      lastFreehandFrameRef.current = now;
    }
    if (isDrawingRef.current) {
      freehandRafRef.current = window.requestAnimationFrame(freehandTick);
    }
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const originScreen = localPointFromClient(e.clientX, e.clientY);
    if (e.ctrlKey || e.metaKey) {
      dispatch(wheelZoom({ deltaY: e.deltaY, originScreen }));
    } else {
      const dx = e.shiftKey ? e.deltaY : e.deltaX;
      const dy = e.shiftKey ? 0 : e.deltaY;
      dispatch(wheelPan({ dx: -dx, dy: -dy }));
    }
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    console.log(
      "🔥 CLICK DETECTED! Tool:",
      currentTool,
      "| Target classes:",
      target.className,
    );

    const isButton =
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.classList.contains("pointer-events-auto") ||
      target.closest(".pointer-events-auto");

    if (!isButton) {
      e.preventDefault();
    } else {
      console.log("clicked button, not preventing default");
      return;
    }

    const local = getLocalPointFromPointer(e.nativeEvent);
    const world = screenToWorld(local, viewport.translate, viewport.scale);

    canvasRef.current?.setPointerCapture(e.pointerId);
    const isPanButton = e.button === 1 || e.button === 2;
    const panByShift = isSpacePressed.current && e.button === 0;

    if (isPanButton || panByShift) {
      const mode = isSpacePressed.current ? "shiftPanning" : "panning";
      dispatch(panStart({ screen: local, mode }));
      return; // Exit early if panning
    }

    if (e.button === 0) {
      // 1. SELECT TOOL LOGIC
      if (currentTool === "select") {
        const hitShape = getShapeAtPoint(world);

        if (hitShape) {
          const isAlreadySelected =
            selectedShapes[hitShape.id as keyof typeof selectedShapes];
          if (!isAlreadySelected) {
            if (!e.shiftKey) dispatch(clearSelection());
            dispatch(selectShape(hitShape.id));
          }
          isMovingRef.current = true;
          mouseStartRef.current = world;

          initialShapePositionsRef.current = {};
          Object.keys(selectedShapes).forEach((id) => {
            const shape = state.entities[id];
            if (shape) {
              if (
                shape.type === "frame" ||
                shape.type === "rect" ||
                shape.type === "ellipse" ||
                shape.type === "generatedui"
              ) {
                initialShapePositionsRef.current[id] = {
                  x: shape.x,
                  y: shape.y,
                };
              } else if (shape.type === "freedraw") {
                initialShapePositionsRef.current[id] = {
                  points: [...(shape as any).points],
                };
              }
            }
          });

          if (
            hitShape.type === "frame" ||
            hitShape.type === "rect" ||
            hitShape.type === "ellipse" ||
            hitShape.type === "generatedui"
          ) {
            initialShapePositionsRef.current[hitShape.id] = {
              x: hitShape.x,
              y: hitShape.y,
            };
          } else if (hitShape.type === "freedraw") {
            initialShapePositionsRef.current[hitShape.id] = {
              points: [...(hitShape as any).points],
            };
          } else if (hitShape.type === "arrow" || hitShape.type === "line") {
            initialShapePositionsRef.current[hitShape.id] = {
              startX: (hitShape as any).startX,
              startY: (hitShape as any).startY,
              endX: (hitShape as any).endX,
              endY: (hitShape as any).endY,
            };
          } else if (hitShape.type === "text") {
            initialShapePositionsRef.current[hitShape.id] = {
              x: hitShape.x,
              y: hitShape.y,
            };
          }
        } else {
          if (!e.shiftKey) {
            dispatch(clearSelection());
            blurActiveTextInput();
          }
        }
      }
      // 2. ERASER TOOL LOGIC (Moved outside the select block!)
      else if (currentTool === "eraser") {
        console.log("Starting erasing at:", world);
        isErasingRef.current = true;
        erasedShapesRef.current.clear();

        const hitShape = getShapeAtPoint(world);
        if (hitShape) {
          dispatch(clearSelection());
          dispatch(removeShape(hitShape.id));
          erasedShapesRef.current.add(hitShape.id);
        }
      }
      // 3. TEXT TOOL LOGIC
      else if (currentTool === "text") {
        dispatch(addText({ x: world.x, y: world.y }));
        dispatch(setTool("select"));
      }
      // 4. DRAWING TOOL LOGIC
      else {
        isDrawingRef.current = true;
        if (
          currentTool === "frame" ||
          currentTool === "rect" ||
          currentTool === "ellipse" ||
          currentTool === "arrow" ||
          currentTool === "line"
        ) {
          console.log("Starting to draw:", currentTool, "at:", world);
          draftShapeRef.current = {
            type: currentTool,
            startWorld: world,
            currentWorld: world,
          };
          requestRender();
        } else if (currentTool === "freedraw") {
          freeDrawRef.current = [world];
          lastFreehandFrameRef.current = performance.now();
          freehandRafRef.current = window.requestAnimationFrame(freehandTick);
          requestRender();
        }
      }
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const local = getLocalPointFromPointer(e.nativeEvent);
    const world = screenToWorld(local, viewport.translate, viewport.scale);

    if (viewport.mode === "panning" || viewport.mode === "shiftPanning") {
      schedulePanMove(local);
      return;
    }

    if (isErasingRef.current && currentTool === "eraser") {
      const hitShape = getShapeAtPoint(world);
      if (hitShape && !erasedShapesRef.current.has(hitShape.id)) {
        dispatch(clearSelection());
        dispatch(removeShape(hitShape.id));
        erasedShapesRef.current.add(hitShape.id);
      }
    }
    if (
      isMovingRef.current &&
      mouseStartRef.current &&
      currentTool === "select"
    ) {
      const dx = world.x - mouseStartRef.current.x;
      const dy = world.y - mouseStartRef.current.y;
      Object.keys(initialShapePositionsRef.current).forEach((id) => {
        const initialPos = initialShapePositionsRef.current[id];
        const shape = state.entities[id];

        if (shape && initialPos) {
          if (
            shape.type === "frame" ||
            shape.type === "rect" ||
            shape.type === "ellipse" ||
            shape.type === "text" ||
            shape.type === "generatedui"
          ) {
            if (
              typeof initialPos.x === "number" &&
              typeof initialPos.y === "number"
            ) {
              dispatch(
                updateShape({
                  id,
                  patch: {
                    x: initialPos.x + dx,
                    y: initialPos.y + dy,
                  },
                }),
              );
            }
          } else if (shape.type === "freedraw") {
            const initialPoints = initialPos.points;

            if (initialPoints) {
              const newPoints = initialPoints.map((point: Point) => ({
                x: point.x + dx,
                y: point.y + dy,
              }));

              dispatch(
                updateShape({
                  id,
                  patch: {
                    points: newPoints,
                  },
                }),
              );
            }
          } else if (shape.type === "arrow" || shape.type === "line") {
            if (
              typeof initialPos.startX === "number" &&
              typeof initialPos.startY === "number" &&
              typeof initialPos.endX === "number" &&
              typeof initialPos.endY === "number"
            ) {
              dispatch(
                updateShape({
                  id,
                  patch: {
                    startX: initialPos.startX + dx,
                    startY: initialPos.startY + dy,
                    endX: initialPos.endX + dx,
                    endY: initialPos.endY + dy,
                  },
                }),
              );
            }
          }
        }
      });
    }
    if (isDrawingRef.current) {
      if (draftShapeRef.current) {
        draftShapeRef.current.currentWorld = world;
        requestRender();
      } else if (currentTool === "freedraw" && freeDrawRef.current) {
        freeDrawRef.current.push(world);
      }
    }
  };

  const finalDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (freehandRafRef.current) {
      window.cancelAnimationFrame(freehandRafRef.current);
      freehandRafRef.current = null;
    }

    const draft = draftShapeRef.current;
    if (draft) {
      const x = Math.min(draft.startWorld.x, draft.currentWorld.x);
      const y = Math.min(draft.startWorld.y, draft.currentWorld.y);
      const w = Math.abs(draft.currentWorld.x - draft.startWorld.x);
      const h = Math.abs(draft.currentWorld.y - draft.startWorld.y);
      if (w > 1 && h > 1) {
        if (draft.type === "frame") {
          dispatch(addFrame({ x, y, w, h }));
        } else if (draft.type === "rect") {
          dispatch(addRect({ x, y, w, h }));
        } else if (draft.type === "ellipse") {
          dispatch(addEllipse({ x, y, w, h }));
        } else if (draft.type === "arrow") {
          dispatch(
            addArrow({
              startX: draft.startWorld.x,
              startY: draft.startWorld.y,
              endX: draft.currentWorld.x,
              endY: draft.currentWorld.y,
            }),
          );
        } else if (draft.type === "line") {
          dispatch(
            addLine({
              startX: draft.startWorld.x,
              startY: draft.startWorld.y,
              endX: draft.currentWorld.x,
              endY: draft.currentWorld.y,
            }),
          );
        }
      }
      draftShapeRef.current = null;
    } else if (currentTool === "freedraw") {
      const points = freeDrawRef.current;
      if (points && points.length > 1) {
        dispatch(addFreeDrawShape({ points: points || [] }));
      }

      requestRender();
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    if (viewport.mode === "panning" || viewport.mode === "shiftPanning") {
      dispatch(panEnd());
    }

    if (isMovingRef.current) {
      isMovingRef.current = false;
      initialShapePositionsRef.current = {};
      mouseStartRef.current = null;
    }

    if (isErasingRef.current) {
      isErasingRef.current = false;
      erasedShapesRef.current.clear();
    }

    finalDrawing();
  };

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = (e) => {
    onPointerUp(e);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      if (!e.repeat) {
        e.preventDefault();
        isSpacePressed.current = true;
        dispatch(handToolEnable());
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      e.preventDefault();
      isSpacePressed.current = false;
      dispatch(handToolDisable());
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      if (freehandRafRef.current) {
        window.cancelAnimationFrame(freehandRafRef.current);
      }
      if (panRafRef.current) {
        window.cancelAnimationFrame(panRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleResizeStart = (e: any) => {
      const { shapeId, corner, bounds } = e.detail;
      isResizingRef.current = true;
      resizeDataRef.current = {
        shapeId,
        corner,
        initialBounds: bounds,
        startPoint: { x: e.clientX || 0, y: e.clientY || 0 },
      };
    };

    const handleResizeMove = (e: CustomEvent) => {
      if (!isResizingRef.current || !resizeDataRef.current) return;

      const { shapeId, corner, initialBounds } = resizeDataRef.current;
      const { clientX, clientY } = e.detail;
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      const rect = canvasEl.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const worldPoint = screenToWorld(
        { x: localX, y: localY },
        viewport.translate,
        viewport.scale,
      );
      const shape = state.entities[shapeId];

      if (!shape) return;

      const newBounds = { ...initialBounds };
      switch (corner) {
        case "nw": {
          const potW = initialBounds.width + (initialBounds.x - worldPoint.x);
          const potH = initialBounds.height + (initialBounds.y - worldPoint.y);
          newBounds.width = Math.max(10, potW);
          newBounds.height = Math.max(10, potH);
          newBounds.x = initialBounds.x + initialBounds.width - newBounds.width;
          newBounds.y =
            initialBounds.y + initialBounds.height - newBounds.height;
          break;
        }
        case "ne":
          newBounds.width = Math.max(10, worldPoint.x - initialBounds.x);
          newBounds.height = Math.max(
            10,
            initialBounds.height + (initialBounds.y - worldPoint.y),
          );
          newBounds.y =
            initialBounds.y + initialBounds.height - newBounds.height;
          break;
        case "sw":
          newBounds.width = Math.max(
            10,
            initialBounds.width + (initialBounds.x - worldPoint.x),
          );
          newBounds.height = Math.max(10, worldPoint.y - initialBounds.y);
          newBounds.x = initialBounds.x + initialBounds.width - newBounds.width;
          break;
        case "se":
          newBounds.width = Math.max(10, worldPoint.x - initialBounds.x);
          newBounds.height = Math.max(10, worldPoint.y - initialBounds.y);
          break;
      }

      if (
        shape.type === "frame" ||
        shape.type === "rect" ||
        shape.type === "ellipse"
      ) {
        dispatch(
          updateShape({
            id: shapeId,
            patch: {
              x: newBounds.x,
              y: newBounds.y,
              w: newBounds.width,
              h: newBounds.height,
            },
          }),
        );
      } else if (shape.type === "freedraw") {
        const xs = shape.points.map((p: { x: number; y: number }) => p.x);
        const ys = shape.points.map((p: { x: number; y: number }) => p.y);
        const actualMinX = Math.min(...xs);
        const actualMaxX = Math.max(...xs);
        const actualMinY = Math.min(...ys);
        const actualMaxY = Math.max(...ys);
        const actualWidth = actualMaxX - actualMinX;
        const actualHeight = actualMaxY - actualMinY;

        const newActualX = newBounds.x + 5;
        const newActualY = newBounds.y + 5;
        const newActualWidth = Math.max(10, newBounds.width - 10);
        const newActualHeight = Math.max(10, newBounds.height - 10);

        const scaleX = actualWidth > 0 ? newActualWidth / actualWidth : 1;
        const scaleY = actualHeight > 0 ? newActualHeight / actualHeight : 1;

        const scaledPoints = shape.points.map(
          (p: { x: number; y: number }) => ({
            x: newActualX + (p.x - actualMinX) * scaleX,
            y: newActualY + (p.y - actualMinY) * scaleY,
          }),
        );
        dispatch(
          updateShape({
            id: shapeId,
            patch: {
              points: scaledPoints,
            },
          }),
        );
      } else if (shape.type === "arrow" || shape.type === "line") {
        const actualMinX = Math.min(shape.startX, shape.endX);
        const actualMaxX = Math.max(shape.startX, shape.endX);
        const actualMinY = Math.min(shape.startY, shape.endY);
        const actualMaxY = Math.max(shape.startY, shape.endY);
        const actualWidth = actualMaxX - actualMinX;
        const actualHeight = actualMaxY - actualMinY;

        const newActualX = newBounds.x + 5;
        const newActualY = newBounds.y + 5;
        const newActualWidth = Math.max(10, newBounds.width - 10);
        const newActualHeight = Math.max(10, newBounds.height - 10);

        let newStartX = 0,
          newStartY = 0,
          newEndX = 0,
          newEndY = 0;

        if (actualWidth === 0) {
          newStartX = newActualX + newActualWidth / 2;
          newEndX = newActualX + newActualWidth / 2;
          newStartY =
            shape.startY < shape.endY
              ? newActualY
              : newActualY + newActualHeight;
          newEndY =
            shape.startY < shape.endY
              ? newActualY + newActualHeight
              : newActualY;
        } else if (actualHeight === 0) {
          newStartY = newActualY + newActualHeight / 2;
          newEndY = newActualY + newActualHeight / 2;
          newStartX =
            shape.startX < shape.endX
              ? newActualX
              : newActualX + newActualWidth;
          newEndX =
            shape.startX < shape.endX
              ? newActualX + newActualWidth
              : newActualX;
        } else {
          const scaleX = newActualWidth / actualWidth;
          const scaleY = newActualHeight / actualHeight;

          newStartX = newActualX + (shape.startX - actualMinX) * scaleX;
          newStartY = newActualY + (shape.startY - actualMinY) * scaleY;
          newEndX = newActualX + (shape.endX - actualMinX) * scaleX;
          newEndY = newActualY + (shape.endY - actualMinY) * scaleY;
        }

        dispatch(
          updateShape({
            id: shapeId,
            patch: {
              startX: newStartX,
              startY: newStartY,
              endX: newEndX,
              endY: newEndY,
            },
          }),
        );
      }
    };

    const handleResizeEnd = () => {
      isResizingRef.current = false;
      resizeDataRef.current = null;
    };

    window.addEventListener(
      "shape-resize-start",
      handleResizeStart as EventListener,
    );
    window.addEventListener(
      "shape-resize-move",
      handleResizeMove as EventListener,
    );
    window.addEventListener(
      "shape-resize-end",
      handleResizeEnd as EventListener,
    );

    return () => {
      window.removeEventListener(
        "shape-resize-start",
        handleResizeStart as EventListener,
      );
      window.removeEventListener(
        "shape-resize-move",
        handleResizeMove as EventListener,
      );
      window.removeEventListener(
        "shape-resize-end",
        handleResizeEnd as EventListener,
      );
    };
  }, [dispatch, state.entities, viewport.translate, viewport.scale]);

  const attachCanvasRef = (ref: HTMLDivElement | null): void => {
    if (canvasRef.current) {
      canvasRef.current.removeEventListener("wheel", onWheel);
    }

    canvasRef.current = ref;
    if (ref) {
      ref.addEventListener("wheel", onWheel, { passive: false });
    }
  };

  const selectTool = (tool: Tool): void => {
    dispatch(setTool(tool));
  };

  const getDraftShape = (): DraftShape | null => draftShapeRef.current;
  const getFreeDrawPoints = (): ReadonlyArray<Point> | null =>
    freeDrawRef.current;

  return {
    viewport,
    shapes: shapeList,
    currentTool,
    selectedShapes,

    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,

    attachCanvasRef,
    selectTool,
    getDraftShape,
    getFreeDrawPoints,
    isSidebarOpen,
    hasSelectedText,
    setIsSidebarOpen,
  };
};

export const useFrame = (shape: Shape | undefined) => {
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Corrected the filter type guard to check 's' instead of 'shape'
  // Also filtered out the frame itself from the shapes array
  const allShapes = useAppSelector((state) =>
    Object.values(state.shapes.shapes.entities).filter(
      (s): s is Shape => s !== undefined,
    ),
  );

  const handleGenerateDesign = useCallback(async (prompt?: string) => {
    // Guard clause if shape isn't loaded yet
    if (!shape) return;

    try {
      setIsGenerating(true);
      const formData = new FormData();

      let targetGeneratedUIId = "";

      if (shape.type === "frame") {
        const snapshot = await generateFrameSnapshot(shape, allShapes);
        downloadBlob(snapshot, `frame-${shape.id}.png`);
        formData.append("image", snapshot, `frame-${shape.id}.png`);
        formData.append("frameNumber", shape.frameNumber.toString());

        const generateUIPosition = {
          x: shape.x + shape.w + 50, // 20px to the right of the frame
          y: shape.y, // aligned with the top of the frame
          w: Math.max(400, shape.w), // at least 400px wide
          h: Math.max(300, shape.h), // at least 300px tall
        };
  
        targetGeneratedUIId = nanoid();
  
        dispatch(
          addGeneratedUI({
            ...generateUIPosition,
            id: targetGeneratedUIId,
            uiSpecData: null,
            sourceFrameId: shape.id,
          }),
        );
      } else if (shape.type === "generatedui") {
        formData.append("uiSpecData", shape.uiSpecData || "");
        
        const generateUIPosition = {
          x: shape.x + shape.w + 50, // 50px to the right of the existing generated UI
          y: shape.y, // aligned with the top
          w: shape.w, // same width as the original
          h: shape.h, // same height
        };

        targetGeneratedUIId = nanoid();

        dispatch(
          addGeneratedUI({
            ...generateUIPosition,
            id: targetGeneratedUIId,
            uiSpecData: null,
            // @ts-ignore
            sourceFrameId: shape.sourceFrameId || shape.id, 
          }),
        );

        dispatch(clearSelection());
        dispatch(selectShape(targetGeneratedUIId));
      } else {
        return; // Unsupported shape type
      }

      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get("project");
      if (!projectId) {
        throw new Error("No project ID found in URL. Cannot generate design without a project.");
      }
      formData.append("projectId", projectId);
      if (prompt) {
        formData.append("prompt", prompt);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let markup = "";

      let time = 0;
      const update = 200;

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              dispatch(
                updateShape({
                  id: targetGeneratedUIId,
                  patch: {
                    uiSpecData: markup,
                  },
                }),
              );
              break
            }
            const chunk = decoder.decode(value)
            markup += chunk;

            const now = Date.now();
            if (now - time >= update) {
              dispatch(
                updateShape({
                  id: targetGeneratedUIId,
                  patch: {
                    uiSpecData: markup,
                  },
                }),
              );
              time = now;
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      console.log("FormData ready for API:", formData);

    } catch (error) {
      console.error("Failed to generate design snapshot:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [shape, allShapes, dispatch]);

  return {
    isGenerating,
    handleGenerateDesign,
  };
};

export const ExportDesign = (generatedUIId: string, htmlContent: string) => {
  if (!htmlContent) {
    console.warn("No HTML content provided to export.");
    return;
  }

  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Design ${generatedUIId}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `.trim();

  const blob = new Blob([fullHtml], { type: "text/html" });
  downloadBlob(blob, `design-${generatedUIId}.html`);
};