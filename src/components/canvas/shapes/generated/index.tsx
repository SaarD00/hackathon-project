import { Button } from "@/components/ui/button";
import { GeneratedUIShape, updateShape } from "@/redux/slice/shapes";
import { useAppDispatch } from "@/redux/store";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
    shape: GeneratedUIShape
    toggleChat?: (generatedUIId: string) => void
    generateWorkflow?: (generatedUIId: string) => void
    exportDesign?: (generatedUIId: string, htmlContent: string) => void
};

const DESIGN_WIDTH = 1280;

/**
 * Build a full HTML document that wraps the AI-generated body content
 * with proper head tags, Tailwind CDN, and a height-reporter script.
 */
const buildPreviewDoc = (bodyHtml: string, shapeId: string): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            overflow: hidden;
            width: ${DESIGN_WIDTH}px;
        }
    </style>
</head>
<body>
    ${bodyHtml}
    <script>
        // Report the rendered content height back to the parent
        function reportHeight() {
            const h = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'iframe-height', shapeId: '${shapeId}', height: h }, '*');
        }
        // Report after initial render
        window.addEventListener('load', () => { setTimeout(reportHeight, 200); });
        // Also report after Tailwind finishes processing
        new MutationObserver(() => { setTimeout(reportHeight, 100); })
            .observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    <\/script>
</body>
</html>`;
};

const GeneratedUi = ({
    shape,
    exportDesign,
    generateWorkflow,
    toggleChat,
}: Props) => {
    const dispatch = useAppDispatch();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [iframeHeight, setIframeHeight] = useState<number>(0);

    const scaleFactor = shape.w / DESIGN_WIDTH;

    // Build the srcdoc only when the HTML content changes
    const srcdoc = useMemo(() => {
        if (!shape.uiSpecData) return '';
        return buildPreviewDoc(shape.uiSpecData, shape.id);
    }, [shape.uiSpecData, shape.id]);

    // Listen for height reports from the iframe
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.type === 'iframe-height' && e.data.shapeId === shape.id) {
                const rawHeight = e.data.height as number;
                setIframeHeight(rawHeight);

                // Update shape height in Redux for canvas hit-testing
                const scaledHeight = rawHeight * scaleFactor;
                const totalHeight = scaledHeight + 56; // header + padding
                if (Math.abs(totalHeight - shape.h) > 10) {
                    dispatch(
                        updateShape({
                            id: shape.id,
                            patch: { h: totalHeight },
                        })
                    );
                }
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [shape.id, shape.h, scaleFactor, dispatch]);

    const handlExportDesign = () => {
        if (!shape.uiSpecData) {
            console.warn("No UI Data to export")
            return
        }
        exportDesign?.(shape.id, shape.uiSpecData)
    }

    const scaledHeight = iframeHeight > 0 ? iframeHeight * scaleFactor : 600;

    return (
        <div
            ref={containerRef}
            className="absolute flex pointer-events-none"
            style={{
                left: shape.x,
                top: shape.y,
                width: shape.w,
                height: "auto",
            }}
        >
            <div className="relative p-4 bg-[#020202] w-full rounded-2xl border border-white/50 ">
                <div className=" -top-10 justify-between mb-2 items-center  flex">

                    <div style={{ fontSize: '20px' }} className=" -top-6 left-0 text-md p-2   rounded whitespace-nowrap text-white/60 bg-black/40">
                        Generated UI
                    </div>
                    <Button size="default" variant="outline" onClick={handlExportDesign} disabled={!shape.uiSpecData} style={{ pointerEvents: "auto" }}>Export</Button>
                </div>
                <div>
                    {shape.uiSpecData ? (
                        <div
                            className="overflow-hidden rounded-xl"
                            style={{
                                height: `${scaledHeight}px`,
                            }}
                        >
                            <iframe
                                srcDoc={srcdoc}
                                sandbox="allow-scripts"
                                style={{
                                    width: `${DESIGN_WIDTH}px`,
                                    height: iframeHeight > 0 ? `${iframeHeight}px` : '10px',
                                    border: 'none',
                                    transformOrigin: 'top left',
                                    transform: `scale(${scaleFactor})`,
                                    display: 'block',
                                }}
                                title="Generated UI Preview"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-8 text-white/60">
                            <p className="animate-pulse">Generating Design...</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default GeneratedUi;

