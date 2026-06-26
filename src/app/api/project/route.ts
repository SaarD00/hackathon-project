import { inngest } from "@/inngest/client"
import { NextRequest, NextResponse } from "next/server"
 

interface UpdateProjectRequest {
    projectId: string,
    shapesData: {
        shapes: Record<string, unknown>
        tool: string,
        selected: Record<string, unknown>
        frameCounter: number,
    }
    viewportData: {
        scale: number,
        translate: {x: number; y: number},
    }
}


export  async function PATCH(req: NextRequest) {
    try {
        const body: UpdateProjectRequest & {userId: string} = await req.json()
        const { projectId, shapesData, viewportData, userId } = body

        // Validate the request body
        if (!projectId || !userId || !shapesData || !viewportData) {
            return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const result = await inngest.send({
            name: "project/autosave.requested",
            data: {
                projectId,
                shapesData,
                viewportData,
                userId
            }
        })

        return NextResponse.json({ success: true, result, message: "Autosave request sent successfully", eventId: result.ids[0] })
    }
    catch (error) {
        console.error("Error handling autosave request:", error)
        return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}