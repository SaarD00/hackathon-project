import { FrameShape, Shape } from "@/redux/slice/shapes";

export const isShapeInsideFrame = (shape: Shape, frame: FrameShape): boolean => {
  const frameLeft = frame.x;
  const frameRight = frame.x + frame.w;
  const frameTop = frame.y;
  const frameBottom = frame.y + frame.h;

  switch (shape.type) {
    case "rect":
    case "ellipse":
    case "frame": {
      const centerX = shape.x + shape.w / 2;
      const centerY = shape.y + shape.h / 2;
      return (
        centerX >= frameLeft &&
        centerX <= frameRight &&
        centerY >= frameTop &&
        centerY <= frameBottom
      );
    }
    case "text":
      return (
        shape.x >= frameLeft &&
        shape.x <= frameRight &&
        shape.y >= frameTop &&
        shape.y <= frameBottom
      );
    case "freedraw":
      return (
        Array.isArray(shape.points) &&
        shape.points.some(
          (point) =>
            point.x >= frameLeft &&
            point.x <= frameRight &&
            point.y >= frameTop &&
            point.y <= frameBottom
        )
      );
    case "arrow":
    case "line": {
      const startInside =
        shape.startX >= frameLeft &&
        shape.startX <= frameRight &&
        shape.startY >= frameTop &&
        shape.startY <= frameBottom;
      const endInside =
        shape.endX >= frameLeft &&
        shape.endX <= frameRight &&
        shape.endY >= frameTop &&
        shape.endY <= frameBottom;
      return startInside || endInside;
    }
    default:
      return false;
  }
};

export const getShapesInsideFrame = (
  shapes: Shape[],
  frame: FrameShape
): Shape[] => {
  // Defensive guard against runtime anomalies
  if (!Array.isArray(shapes)) {
    console.error("getShapesInsideFrame received an invalid shapes array:", shapes);
    return [];
  }

  const shapesInFrame = shapes.filter(
    (shape) => shape && shape.id !== frame.id && isShapeInsideFrame(shape, frame)
  );

  console.log(`Frame ${frame.frameNumber} capture:`, {
    totalShapes: shapes.length,
    captured: shapesInFrame.length,
    capturedTypes: shapesInFrame.map((s) => s.type),
  });

  return shapesInFrame;
};

const renderShapeOnCanvas = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  offsetX: number,
  offsetY: number
) => {
  ctx.save();
  
  // Set consistent default stroke and fallback styling configurations
  ctx.strokeStyle = shape.stroke && shape.stroke !== "transparent" ? shape.stroke : "#000000";
  ctx.lineWidth = shape.strokeWidth || 2;

  switch (shape.type) {
    case "frame":
    case "rect":
    case "ellipse": {
      const relativeX = shape.x - offsetX;
      const relativeY = shape.y - offsetY;

      if (shape.type === "rect" || shape.type === "frame") {
        const borderRadius = shape.type === "frame" ? 8 : 0;
        ctx.beginPath();
        ctx.roundRect(relativeX, relativeY, shape.w, shape.h, borderRadius);
        ctx.stroke();
      } else if (shape.type === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(
          relativeX + shape.w / 2,
          relativeY + shape.h / 2,
          shape.w / 2,
          shape.h / 2,
          0,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
      break;
    }

    case "text": {
      ctx.fillStyle = shape.stroke && shape.stroke !== "transparent" ? shape.stroke : "#000000";
      ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || "Inter, sans-serif"}`;
      ctx.textBaseline = "top";
      const textX = shape.x - offsetX;
      const textY = shape.y - offsetY;
      const padding = 4;
      ctx.fillText(shape.text, textX + padding, textY + padding);
      break;
    }

    case "freedraw":
      if (Array.isArray(shape.points) && shape.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x - offsetX, shape.points[0].y - offsetY);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x - offsetX, shape.points[i].y - offsetY);
        }
        ctx.stroke();
      }
      break;

    case "arrow": {
      const headLength = 10;
      const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      ctx.beginPath();
      ctx.moveTo(shape.startX - offsetX, shape.startY - offsetY);
      ctx.lineTo(shape.endX - offsetX, shape.endY - offsetY);
      ctx.stroke();
      
      // Use stroke color to fill the arrowhead completely
      ctx.fillStyle = shape.stroke && shape.stroke !== "transparent" ? shape.stroke : "#000000";
      ctx.beginPath();
      ctx.moveTo(shape.endX - offsetX, shape.endY - offsetY);
      ctx.lineTo(
        shape.endX - offsetX - headLength * Math.cos(angle - Math.PI / 6),
        shape.endY - offsetY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        shape.endX - offsetX - headLength * Math.cos(angle + Math.PI / 6),
        shape.endY - offsetY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "line":
      ctx.beginPath();
      ctx.moveTo(shape.startX - offsetX, shape.startY - offsetY);
      ctx.lineTo(shape.endX - offsetX, shape.endY - offsetY);
      ctx.stroke();
      break;
  }

  ctx.restore();
};

export const generateFrameSnapshot = async (
  shape: FrameShape,
  allShapes: Shape[]
): Promise<Blob> => {
  // FIX: Swapped arguments here to correctly match (shapes, frame) signature
  const shapesIn = getShapesInsideFrame(allShapes, shape);

  const canvas = document.createElement("canvas");
  canvas.width = shape.w;
  canvas.height = shape.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  // Optional styling choice: set background bounds
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, shape.w, shape.h);
  ctx.clip();

  shapesIn.forEach((s) => {
    renderShapeOnCanvas(ctx, s, shape.x, shape.y);
  });

  ctx.restore();
  console.log("All inside frame elements rendered onto snapshot instance.");

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate frame snapshot file output"));
        }
      },
      "image/png",
      1.0
    );
  });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};