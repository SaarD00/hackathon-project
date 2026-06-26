import InfiniteCanvas from '@/components/canvas'
import ProjectsProvider from '@/components/projects/list/provider'
import ProjectProvider from '@/components/projects/provider'
import { MoodBoardImagesQuery, ProjectQuery, ProjectsQuery, StyleGuideQuery } from '@/convex/query.config'
import { MoodBoardImage } from '@/hooks/use-styles'
import { StyleGuide } from '@/redux/api/style-guide'
import ToolBar from '@/components/canvas/toolbar'
import PromptWindow from '@/components/canvas/prompt-window'
import React from 'react'

interface CanvasProps {
    searchParams: Promise<{ project?: string }>

}

const Page = async ({ searchParams }: CanvasProps) => {
    const params = await searchParams
    const projectId = params.project || ""

    const existingStyleGuide = await StyleGuideQuery(projectId)

    const style = existingStyleGuide.styleGuide._valueJSON as unknown as StyleGuide

    const colorGuide = style?.colorSections
    // @ts-ignore
    const typoGraphyGuide = style?.typography
    console.log(typoGraphyGuide)
    const existingMoodBoardImages = await MoodBoardImagesQuery(projectId)

    const guideImages = existingMoodBoardImages.moodBoardImages._valueJSON as unknown as MoodBoardImage[]
    if (!projectId) {
        return (
            <div className='w-full h-screen flex items-center justify-center'>
                <h2>No Project Selected</h2>

            </div>
        )
    }
    const { projects, profile } = await ProjectQuery(projectId)

    return (
        <ProjectProvider initialProject={projects}>
            <InfiniteCanvas />
            <ToolBar colorGuide={colorGuide} typoGraphyGuide={typoGraphyGuide} guideImages={guideImages} />
            <PromptWindow />
        </ProjectProvider>
    )
}

export default Page
