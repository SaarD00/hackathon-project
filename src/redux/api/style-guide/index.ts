import { MoodBoardImage } from "@/hooks/use-styles"
import {  fetchBaseQuery } from "@reduxjs/toolkit/query"
import { createApi } from "@reduxjs/toolkit/query/react"

export interface ColorSwatch {
    name: string
    hex: string
    description: string
}



export interface ColorStyle {
    title: | "Primary Colours" | "Secondary & Accents" | "UI component" | "Utility" | "Status & Feedback"
    swatches: ColorSwatch[]
}








export interface TypographyStyle {
    name: string
    fontFamily: string
    fontSize: number
    fontWeight: number
    lineHeight: number
    letterSpacing: number
    description: string
}





export interface typographySection {
    title: string
    styles: TypographyStyle[]
}

export interface StyleGuide {
    title: string;
    description: string;
    colorSections: {

    }
    typographySections: {

    }
}

export interface GenerateStyleGuideRequest {
    projectId: string
}

export interface GenerateStyleGuideResponse {
    styleGuide: StyleGuide
    message: string
    success: boolean
}

export const styleGuideApi = createApi({
    reducerPath: "styleGuideApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/generate" }),
    tagTypes: ["StyleGuide"],
    endpoints: (builder) => ({
        generateStyleGuide: builder.mutation<GenerateStyleGuideResponse, GenerateStyleGuideRequest >({
            query: ({ projectId }) => ({
                url: "/style",
                method: "POST",
                body: { projectId }
            }),
        invalidatesTags: ["StyleGuide"]
        })
    })
})


export  const { useGenerateStyleGuideMutation } = styleGuideApi