import { MoodBoardImagesQuery } from "@/convex/query.config";
import { MoodBoardImage } from "@/hooks/use-styles";
import { prompts } from "@/prompts";
import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { google } from '@ai-sdk/google';

const ColorSwatchSchema = z.object({
  name: z.string(),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color"),
  description: z.string().optional(),
});

// 🛠️ FIXED: Changed strict .length() to .min() so the Lite model doesn't break Zod
// Drop all minimums to 1 to accommodate the Lite model's conciseness
const PrimaryColorsSchema = z.object({
  title: z.literal("Primary Colours"),
  swatches: z.array(ColorSwatchSchema).min(1),
});

const SecondaryColorsSchema = z.object({
  title: z.literal("Secondary & Accent Colors"),
  swatches: z.array(ColorSwatchSchema).min(1),
});

const UIComponentColorsSchema = z.object({
  title: z.literal("UI Component Colors"),
  swatches: z.array(ColorSwatchSchema).min(1),
});

const StatusColorsSchema = z.object({
  title: z.literal("Status & Feedback Colors"),
  swatches: z.array(ColorSwatchSchema).min(1), // 🛠️ FIXED: Changed from 2 to 1
});

const TypoGraphyStyle = z.object({
  name: z.string(),
  fontFamily: z.string(),
  fontSize: z.string(),
  fontWeight: z.string(),
  lineHeight: z.string(),
  letterSpacing: z.string(),
  description: z.string().optional(),
});

const TypographyScheme = z.object({
  title: z.string(),
  styles: z.array(TypoGraphyStyle).min(1),
});
const styleGuideSchema = z.object({
  theme: z.string(),
  description: z.string(),
  colorSections: z.object({
    primary: PrimaryColorsSchema,
    secondary: SecondaryColorsSchema,
    uiComponents: UIComponentColorsSchema,
    status: StatusColorsSchema,
  }),
  typography: z.array(TypographyScheme).min(1),
});
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const moodBoardImages = await MoodBoardImagesQuery(projectId);
    if (!moodBoardImages || !moodBoardImages.moodBoardImages) {
      return NextResponse.json({ error: "No mood board images found" }, { status: 400 });
    }

    const images = moodBoardImages.moodBoardImages._valueJSON as unknown as MoodBoardImage[];
    const img_urls = images.map((img) => img.url).filter(Boolean);
    const sysPrompt = prompts.styleGuide.system;

    const userPrompt = `Analyze these ${img_urls.length} mood board images and generate a design system: Extract colors that work harmoniously together and create typography that matches the aesthetic. Return ONLY the JSON object matching the exact schema structure above.`;

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      system: sysPrompt,
      schema: styleGuideSchema,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            ...img_urls.map((url) => ({
              type: "image" as const,
              image: url as string     // 🛠️ FIXED: Actually instantiating the URL object now!
            })),
          ],
        },
      ],
    });

    console.log("Raw result from AI:", result); // Debug log to see the raw output
    if (!result || !result.object) {
      return NextResponse.json({ error: "Failed to generate style guide object" }, { status: 500 });
    }

    await fetchMutation(
      api.projects.updateProjectStyleGuide,
      {
        projectId: projectId as Id<"projects">,
        styleGuide: result.object,
      },
      {
        token: await convexAuthNextjsToken(),
      },
    );

    return NextResponse.json({
      success: true,
      styleGuide: result.object,
      message: "Style guide generated and saved successfully"
    });

  } catch (error) {
    console.error("Error generating style guide:", error); //  Will print exact details in terminal
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    );
  }
}