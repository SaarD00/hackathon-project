import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


interface AutosaveProjectResponse {
    projectId: string,
    userId: string,
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

interface AutosaveProjectRequest {
    projectId: string,
    data: any,
}
export const ProjectApi = createApi({
    reducerPath: 'projectApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/project' }),
    tagTypes: ['Project'],
    endpoints: (builder) => ({
        // 1. Fixed the spelling to "autosaveProject"
        autosaveProject: builder.mutation<AutosaveProjectResponse, AutosaveProjectRequest>({
            query: (data) => ({
                url: "",
                method: "PATCH",
                body: data,
            })
        })
    }),
})
export const { useAutosaveProjectMutation } = ProjectApi