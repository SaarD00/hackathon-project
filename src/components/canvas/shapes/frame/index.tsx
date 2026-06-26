// "use client"

import { FrameShape } from "@/redux/slice/shapes";

export const Frame = ({
  shape,
}: {
  shape: FrameShape;
}) => {
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
    </>
  );
};
