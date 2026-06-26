import { InspirationImagesQuery, MoodBoardImagesQuery, StyleGuideQuery } from "@/convex/query.config";
import { prompts } from "@/prompts";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const projectId = formData.get("projectId") as string;
    const prompt = formData.get("prompt") as string | null;
    const uiSpecData = formData.get("uiSpecData") as string | null;

    if (!projectId) {
      return NextResponse.json(
        { error: "No projectId provided" },
        { status: 400 },
      );
    }

    if (!imageFile && !uiSpecData) {
      return NextResponse.json(
        { error: "No image file or UI spec data provided" },
        { status: 400 },
      );
    }

    let imageData: string | null = null;
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type. Only images are allowed." },
          { status: 400 },
        );
      }
      const image = await imageFile.arrayBuffer();
      imageData = Buffer.from(image).toString("base64");
    }

    const styleGuide = await StyleGuideQuery(projectId);
    const guide = styleGuide.styleGuide._valueJSON as unknown as {
      colorSections: Record<string, { title: string; swatches: { name: string; hexColor: string; description?: string }[] }>;
      typography: { title: string; styles: { name: string; description?: string; fontFamily: string; fontWeight: string; fontSize: string; lineHeight: string }[] }[];
    };

    const inspirationImages = await MoodBoardImagesQuery(projectId);
    const images = inspirationImages.moodBoardImages._valueJSON as unknown as {
      url: string;
    }[];

    const imgurl = images.map((img) => img.url).filter(Boolean).slice(0, 3);
    const colours = guide?.colorSections ? Object.values(guide.colorSections) : [];
    const typography = guide?.typography || [];

    let systemPrompt: string;
    let userPrompt: string;

    if (uiSpecData) {
      systemPrompt = prompts.generativeUiRefinement.system;
      userPrompt = `Available Colors: ${colours
        .map((color: any) => color.swatches.map((s: any) => s.hexColor).join(", "))
        .join("; ")}\n\n`;
      if (prompt) {
        userPrompt += `USER REQUEST: "${prompt}"\n\n`;
      }
      userPrompt += `CURRENT HTML:\n\`\`\`html\n${uiSpecData}\n\`\`\``;
    } else {
      systemPrompt = prompts.generativeUi.system;
      userPrompt = `StyleGuide:
Colors: ${colours
          .map((color: any) =>
            color.swatches
              .map((swatch: any) => `${swatch.name}: ${swatch.hexColor}`)
              .join(", "),
          )
          .join("; ")}
Typography: ${typography
          .map((t: any) =>
            t.styles
              .map((s: any) => `${s.name}: ${s.fontFamily} ${s.fontWeight} ${s.fontSize}/${s.lineHeight}`)
              .join(", "),
          )
          .join("; ")}
Viewport: 1920x1080 desktop.`;

      if (prompt) {
        userPrompt += `\n\nUser specific request: ${prompt}`;
      }
    }

    const result = streamText({
      model: google("gemini-3-flash-preview"),
      providerOptions: {
        google: {
          reasoningEffort: 'low',
          thinkingBudget: 0.0001,
        }
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            ...(imageData ? [{
              type: "image" as const,
              image: imageData,
            }] : []),
            ...(!uiSpecData ? imgurl.map((url) => ({
              type: "image" as const,
              image: url,
            })) : []),
          ],
        },
      ],
      system: systemPrompt,
      temperature: 0.5,
      headers: {
        'x-gemini-service-tier': 'priority',
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        let totalChunks = 0;
        let totalLength = 0;
        let accumulatedContent = '';

        // Instantiate encoder once outside the loop for better performance
        const encoder = new TextEncoder();

        try {
          for await (const chunk of result.textStream) {
            totalChunks++;
            totalLength += chunk.length;
            accumulatedContent += chunk;

            // Stream the HTML markup text
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': "no-cache",
        Connection: 'keep-alive'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to gen ui",
        details: error instanceof Error ? error.message : "idk",

      },
      { status: 500 }

    )
  }
}
