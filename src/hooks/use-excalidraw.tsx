"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { exportToBlob } from "@excalidraw/excalidraw";

export type GeneratedUIShape = {
  id: string;
  uiSpecData: string;
  w: number;
  h: number;
};

type CanvasContextType = {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  setExcalidrawAPI: (api: ExcalidrawImperativeAPI | null) => void;
  generatedUIs: GeneratedUIShape[];
  setGeneratedUIs: React.Dispatch<React.SetStateAction<GeneratedUIShape[]>>;
  addGeneratedUI: (uiSpecData: string, position?: {x: number, y: number, w: number, h: number}) => string;
  removeGeneratedUI: (id: string) => void;
  updateGeneratedUI: (id: string, uiSpecData: string) => void;
  appState: { zoom: { value: number }, scrollX: number, scrollY: number, selectedElementIds: Record<string, boolean> };
  setAppState: React.Dispatch<React.SetStateAction<any>>;
  selectedElements: readonly ExcalidrawElement[];
  initialData: any;
};

const CanvasContext = createContext<CanvasContextType | null>(null);

export const CanvasProvider = ({ children, initialProject }: { children: React.ReactNode, initialProject: any }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [generatedUIs, setGeneratedUIs] = useState<GeneratedUIShape[]>([]);

  const [appState, setAppState] = useState({
    zoom: { value: 1 },
    scrollX: 0,
    scrollY: 0,
    selectedElementIds: {} as Record<string, boolean>,
  });

  const initialData = useMemo(() => {
    if (initialProject?._valueJSON?.sketchesData) {
      return {
        elements: initialProject._valueJSON.sketchesData,
        appState: initialProject._valueJSON.viewportData,
      };
    }
    return null;
  }, [initialProject]);

  const addGeneratedUI = useCallback((uiSpecData: string, position?: {x: number, y: number, w: number, h: number}) => {
    if (!excalidrawAPI) return "";
    const elements = excalidrawAPI.getSceneElements();

    const newId = `generatedui-${Date.now()}`;
    const newElement: any = {
      type: "rectangle",
      version: 1,
      versionNonce: Date.now(),
      isDeleted: false,
      id: newId,
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      angle: 0,
      x: position?.x ?? (-appState.scrollX + 100),
      y: position?.y ?? (-appState.scrollY + 100),
      strokeColor: "transparent",
      backgroundColor: "transparent",
      width: position?.w ?? 1280,
      height: position?.h ?? 800,
      seed: Math.floor(Math.random() * 1000000),
      groupIds: [],
      frameId: null,
      roundness: null,
      boundElements: [],
      updated: Date.now(),
      link: null,
      locked: false,
      customData: {
        isGeneratedUi: true,
      },
    };

    excalidrawAPI.updateScene({
      elements: [...elements, newElement],
    });

    setGeneratedUIs((prev) => [
      ...prev,
      {
        id: newId,
        uiSpecData,
        w: position?.w ?? 1280,
        h: position?.h ?? 800,
      },
    ]);
    return newId;
  }, [excalidrawAPI, appState]);

  const removeGeneratedUI = useCallback((id: string) => {
    if (!excalidrawAPI) return;
    const elements = excalidrawAPI.getSceneElements();
    excalidrawAPI.updateScene({
      elements: elements.filter((el) => el.id !== id),
    });
    setGeneratedUIs((prev) => prev.filter((ui) => ui.id !== id));
  }, [excalidrawAPI]);

  const updateGeneratedUI = useCallback((id: string, uiSpecData: string) => {
    setGeneratedUIs((prev) => prev.map((ui) => ui.id === id ? { ...ui, uiSpecData } : ui));
  }, []);

  const selectedElements = useMemo(() => {
    if (!excalidrawAPI) return [];
    const elements = excalidrawAPI.getSceneElements();
    return elements.filter(el => appState.selectedElementIds[el.id]);
  }, [excalidrawAPI, appState.selectedElementIds]);

  return (
    <CanvasContext.Provider value={{
      excalidrawAPI,
      setExcalidrawAPI,
      generatedUIs,
      setGeneratedUIs,
      addGeneratedUI,
      removeGeneratedUI,
      updateGeneratedUI,
      appState,
      setAppState,
      selectedElements,
      initialData,
    }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};

export const useFrame = (selectedElement: ExcalidrawElement | undefined, excalidrawAPI: ExcalidrawImperativeAPI | null, addGeneratedUI: any, updateGeneratedUI: any, generatedUIs: GeneratedUIShape[]) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDesign = useCallback(async (prompt?: string) => {
    if (!selectedElement || !excalidrawAPI) return;

    try {
      setIsGenerating(true);
      const formData = new FormData();
      let targetGeneratedUIId = "";

      if (selectedElement.type === "frame") {
        const elements = excalidrawAPI.getSceneElements();
        const elementsInFrame = elements.filter(el => el.frameId === selectedElement.id);
        
        const blob = await exportToBlob({
          elements: elementsInFrame,
          mimeType: "image/png",
          appState: excalidrawAPI.getAppState(),
          exportPadding: 0,
        });

        formData.append("image", blob, `frame-${selectedElement.id}.png`);
        formData.append("frameNumber", "1");

        const generateUIPosition = {
          x: selectedElement.x + selectedElement.width + 50,
          y: selectedElement.y,
          w: Math.max(400, selectedElement.width),
          h: Math.max(300, selectedElement.height),
        };
  
        targetGeneratedUIId = addGeneratedUI(null, generateUIPosition);

      } else if (selectedElement.customData?.isGeneratedUi) {
        const existingUI = generatedUIs.find(ui => ui.id === selectedElement.id);
        formData.append("uiSpecData", existingUI?.uiSpecData || "");
        
        const generateUIPosition = {
          x: selectedElement.x + selectedElement.width + 50,
          y: selectedElement.y,
          w: selectedElement.width,
          h: selectedElement.height,
        };

        targetGeneratedUIId = addGeneratedUI(null, generateUIPosition);
        
        excalidrawAPI.updateScene({
          appState: {
            ...excalidrawAPI.getAppState(),
            selectedElementIds: { [targetGeneratedUIId]: true },
          }
        });
      } else {
        return;
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
        throw new Error(`API error: ${response.status}`);
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
              updateGeneratedUI(targetGeneratedUIId, markup);
              break;
            }
            markup += decoder.decode(value);

            const now = Date.now();
            if (now - time >= update) {
              updateGeneratedUI(targetGeneratedUIId, markup);
              time = now;
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (error) {
      console.error("Failed to generate design snapshot:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedElement, excalidrawAPI, addGeneratedUI, updateGeneratedUI, generatedUIs]);

  return {
    isGenerating,
    handleGenerateDesign,
  };
};

export const ExportDesign = (generatedUIId: string, htmlContent: string) => {
  if (!htmlContent) return;

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Design ${generatedUIId}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `design-${generatedUIId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};