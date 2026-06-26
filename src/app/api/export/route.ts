import { ProjectQuery } from "@/convex/query.config";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { projectId, pages } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "No projectId provided" }, { status: 400 });
    }

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: "No pages provided" }, { status: 400 });
    }

    const project = await ProjectQuery(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "AI Export can only be used once per project in production." },
        { status: 403 }
      );
    }

    const systemPrompt = `You are an expert React and UI developer. The user will provide an array of pages containing generated HTML code for a multi-page web application.
Your task is to analyze the content of all pages and update the \`href\` attributes of \`<a>\` tags so they link to the correct pages.
For example, if you see a link that says "Dashboard" or "Home", you should change its href to "index.html" (or whichever filename corresponds to the Dashboard).
If there is a link for "Settings", change its href to the settings page filename (e.g. "page-2.html").
DO NOT change any of the visual design, Tailwind classes, or other content. ONLY update the \`href\` attributes of \`<a>\` tags.
Return the updated pages. Ensure you preserve the original filename for each page.`;

    const userPrompt = `Here are the pages to wire up:\n\n${JSON.stringify(pages, null, 2)}`;

    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
      temperature: 0.1,
      schema: z.object({
        pages: z.array(
          z.object({
            filename: z.string().describe("The filename of the page (must match the input filename)."),
            html: z.string().describe("The fully updated HTML code for this page."),
          })
        ),
      }),
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate export",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
