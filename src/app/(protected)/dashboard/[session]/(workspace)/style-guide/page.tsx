

import MoodBoard from '@/components/style/mood-board'
import { ThemeContent } from '@/components/style/theme'
import StyleGuideTypography from '@/components/style/typography'
import { TabsContent } from '@/components/ui/tabs'
import { MoodBoardImagesQuery, StyleGuideQuery } from '@/convex/query.config'
import { MoodBoardImage } from '@/hooks/use-styles'
import { StyleGuide } from '@/redux/api/style-guide'
import { Palette } from 'lucide-react'
import React from 'react'
import { StyleRegistry } from 'styled-jsx'

type Props = {
    searchParams: Promise<{
        project: string
    }>
}

const mockTypographyGuide = [
    {
        title: "Display & Headings",
        styles: [
            {
                name: "Display Alpha",
                description: "Reserved exclusively for high-impact landing page hero sections.",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "3.75rem", // 60px
                fontWeight: "800",
                lineHeight: "1.1",
                letterSpacing: "-0.03em"
            },
            {
                name: "Heading 1",
                description: "Primary page identity and major container titles.",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "2.5rem", // 40px
                fontWeight: "700",
                lineHeight: "1.2",
                letterSpacing: "-0.02em"
            },
            {
                name: "Heading 2",
                description: "Sub-sections and standard dashboard block headers.",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "1.75rem", // 28px
                fontWeight: "600",
                lineHeight: "1.3",
                letterSpacing: "-0.01em"
            },
            {
                name: "Heading 3",
                description: "Small card descriptions and localized group definitions.",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "1.25rem", // 20px
                fontWeight: "600",
                lineHeight: "1.4",
                letterSpacing: "0"
            }
        ]
    },
    {
        title: "Text & Interface Utilities",
        styles: [
            {
                name: "Body Editorial",
                description: "Optimized for continuous reading contexts, articles, and long-form prose.",
                fontFamily: "Inter, sans-serif",
                fontSize: "1.125rem", // 18px
                fontWeight: "400",
                lineHeight: "1.65",
                letterSpacing: "-0.005em"
            },
            {
                name: "Body Regular",
                description: "Standard operational text for data layout, input values, and paragraphs.",
                fontFamily: "Inter, sans-serif",
                fontSize: "1rem", // 16px
                fontWeight: "400",
                lineHeight: "1.5",
                letterSpacing: "0"
            },
            {
                name: "UI Micro / Muted",
                description: "Secondary annotations, metadata strings, and input helper instructions.",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.875rem", // 14px
                fontWeight: "200",
                lineHeight: "1.45",
                letterSpacing: "0.01em"
            },
            {
                name: "Accent Overline",
                description: "Uppercase category labels placed directly above principal headers.",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem", // 12px
                fontWeight: "200",
                lineHeight: "1",
                letterSpacing: "0.08em"
            }
        ]
    }
]
const mockColorGuide = [
    {
        title: "Primary Colors",
        swatches: [
            { name: "Primary", hexColor: "#3B82F6", description: "Main brand color" },
            { name: "Primary Dark", hexColor: "#1E40AF", description: "Darker variant" },
            { name: "Primary Light", hexColor: "#DBEAFE", description: "Lighter variant" },
        ]
    },
    {
        title: "Accent Colors",
        swatches: [
            { name: "Success", hexColor: "#10B981", description: "Success states" },
            { name: "Warning", hexColor: "#F59E0B", description: "Warning states" },
            { name: "Error", hexColor: "#EF4444", description: "Error states" },
            { name: "Info", hexColor: "#06B6D4", description: "Info states" },
        ]
    },
    {
        title: "Neutral Colors",
        swatches: [
            { name: "Gray 100", hexColor: "#F9FAFB", description: "Lightest gray" },
            { name: "Gray 500", hexColor: "#6B7280", description: "Medium gray" },
            { name: "Gray 900", hexColor: "#111827", description: "Darkest gray" },
        ]
    }
]

const page = async ({ searchParams }: Props) => {
    const projectId = (await searchParams).project

    const existingStyleGuide = await StyleGuideQuery(projectId)

    const style = existingStyleGuide.styleGuide._valueJSON as unknown as StyleGuide

    const colorGuide = style?.colorSections
    // @ts-ignore
    const typoGraphyGuide = style?.typography
    console.log(typoGraphyGuide)
    const existingMoodBoardImages = await MoodBoardImagesQuery(projectId)

    const guideImages = existingMoodBoardImages.moodBoardImages._valueJSON as unknown as MoodBoardImage[]
    return (
        <div>
            <TabsContent value='colours' className='space-y-8'>
                {!colorGuide ? (
                    // Branch 1: Empty State UI
                    <div className="space-y-8">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                                <Palette className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-light text-foreground mb-2">
                                No colors generated yet
                            </h3>
                            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto mb-6">
                                Upload images to your mood board and generate an AI-powered style guide with colors and typography.
                            </p>
                        </div>
                    </div>
                ) : (
                    // Branch 2: Active State UI
                    // <MoodBoardImages guideImages={guideImages} />
                    <ThemeContent colorGuide={colorGuide} />
                )}
            </TabsContent>

            <TabsContent value='typography'>
                <StyleGuideTypography typographyGuide={typoGraphyGuide} />
            </TabsContent>


            <TabsContent value='moodboard' >
                <MoodBoard guideImages={guideImages} />

            </TabsContent>
        </div>
    )
}

export default page
