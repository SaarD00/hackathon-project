// "use client"

import { FrameShape } from "@/redux/slice/shapes";
import { LiquidGlassButton } from "@/components/buttons/liquid-glass";
import { Brush, Palette } from "lucide-react";
import { useFrame } from "@/hooks/use-canvas";

export const Frame = ({
  shape,
  toggleInspiration,
}: {
  shape: FrameShape;
  toggleInspiration?: () => void;
}) => {
  // @ts-ignore
  const { isGenerating, handleGenerateDesign } = useFrame(shape);

  return (
    <>
      <div
        className="absolute  pointer-events-none  backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] saturate-150"
        style={{
          left: shape.x || 1,
          top: shape.y || 1,
          width: shape.w || 1,
          height: shape.h || 1,
          borderRadius: "12px", // Slightly more rounded for modern feel
        }}
      />
      <div
        className="absolute pointer-events-none whitespace-nowrap text-xs font-medium text-white/80 select-none"
        style={{
          left: shape.x,
          top: shape.y - 24, // Position above the frame
          fontSize: "11px",
          lineHeight: "1.2",
        }}>
        Frame {shape.frameNumber}
      </div>
      <div
        className="absolute pointer-events-auto flex gap-4"
        style={{
          left: shape.x + shape.w - 235, // Position at top right, accounting for button width
          top: shape.y - 36, // Position above the frame with some spacing
          zIndex: 1000, // Ensure button is on top
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}>
        <LiquidGlassButton
          size="sm"
          variant="subtle"
          onClick={toggleInspiration}
          style={{ pointerEvents: "auto" }}>
          <Palette size={12} />
          Inspiration
        </LiquidGlassButton>
        <LiquidGlassButton
          size="sm"
          variant="subtle"
          // @ts-ignore
          onClick={handleGenerateDesign}
          disabled={isGenerating}
          className={isGenerating ? "animate-pulse" : ""}
          style={{ pointerEvents: "auto" }}>
          <Brush size={12} className={isGenerating ? "animate-spin" : ""} />
          {isGenerating ? "Generating..." : "Generate Design"}
        </LiquidGlassButton>
      </div>
    </>
  );
};
