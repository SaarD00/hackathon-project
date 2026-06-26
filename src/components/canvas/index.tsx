"use client";
import { useCanvas, ExportDesign } from "@/hooks/use-canvas";
import React from "react";
import TextSideBar from "./text-bar";
import { cn } from "@/lib/utils";
import ShapeRenderer from "./shapes";
import { RectanglePreview } from "./shapes/rectangle/preview";
import { ArrowPreview } from "./shapes/arrow/preview";
import { ElipsePreview } from "./shapes/elipse/preview";
import { LinePreview } from "./shapes/line/preview";
import { FramePreview } from "./shapes/frame/preview";
import { FreeDrawStrokePreview } from "./shapes/stroke/preview";
import { SelectionOverlay } from "./shapes/selection";

type Props = {};

const InfiniteCanvas = (props: Props) => {
    const {
        viewport,
        shapes,
        currentTool,
        selectedShapes,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        attachCanvasRef,
        getDraftShape,
        getFreeDrawPoints,
        isSidebarOpen,
        hasSelectedText,
    } = useCanvas();

    const draftShape = getDraftShape()
    const freeDrawPoints = getFreeDrawPoints()
    return (
        <div>
            <TextSideBar isOpen={isSidebarOpen} />

            <div
                ref={attachCanvasRef}
                role="application"
                aria-label="drawing cavas"
                // Inside InfiniteCanvas.tsx change the structural wrapper classes:
                className={cn(
                    "relative w-screen h-screen overflow-hidden select-none z-0", // 👈 Changed w-full h-full to w-screen h-screen
                    {
                        "cursor-grabbing": viewport.mode === "panning",
                        "cursor-grab": viewport.mode === "shiftPanning",
                        "cursor-crosshair": currentTool !== "select" && viewport.mode === "idle",
                        "cursor-default": currentTool === "select" && viewport.mode === "idle",
                    }
                )}
                style={{ 
                    touchAction: "none",
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
                    backgroundSize: `${24 * viewport.scale}px ${24 * viewport.scale}px`,
                    backgroundPosition: `${viewport.translate.x}px ${viewport.translate.y}px`
                }}
                onPointerDown={onPointerDown}
                onPointerCancel={onPointerCancel}
                onContextMenu={(e) => e.preventDefault()}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                draggable={false}
            >
                <div
                    className="absolute origin-top-left pointer-events-none z-10"
                    style={{
                        transform: `translate3d(${viewport.translate.x}px, ${viewport.translate.y}px, 0) scale(${viewport.scale})`,
                        transformOrigin: '0 0',
                        willChange: 'transform',
                    }}
                >
                    {shapes.map((shape) => (
                        <ShapeRenderer
                            key={shape.id}
                            shape={shape}
                            exportDesign={ExportDesign}
                        />
                    ))}

                    {shapes.map((shape) => (

                        <SelectionOverlay isSelected={!!selectedShapes[shape.id]} key={`selection-${shape.id}`} shape={shape} />
                    ))}

                    {draftShape && draftShape.type === "rect" && (
                        <RectanglePreview startWorld={draftShape.startWorld} currentWorld={draftShape.currentWorld} />
                    )}
                    {draftShape && draftShape.type === "arrow" && (
                        <ArrowPreview currentWorld={draftShape.currentWorld} startWorld={draftShape.startWorld} />
                    )}
                    {draftShape && draftShape.type === "ellipse" && (
                        <ElipsePreview currentWorld={draftShape.currentWorld} startWorld={draftShape.startWorld} />
                    )}
                    {draftShape && draftShape.type === "line" && (
                        <LinePreview currentWorld={draftShape.currentWorld} startWorld={draftShape.startWorld} />
                    )}
                    {draftShape && draftShape.type === "frame" && (
                        <FramePreview currentWorld={draftShape.currentWorld} startWorld={draftShape.startWorld} />
                    )}
                    {currentTool === 'freedraw' && freeDrawPoints!.length > 1 && (
                        // @ts-ignore
                        <FreeDrawStrokePreview points={freeDrawPoints} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfiniteCanvas;
