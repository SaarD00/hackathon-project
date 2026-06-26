"use client"

import { addProject, createProjectFailure, createProjectStart, createProjectSuccess } from "@/redux/slice/projects"
import { useAppDispatch } from "@/redux/store"
import { fetchMutation } from "convex/nextjs"
import { stat } from "fs"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"


export const useProjectCreation = () => {
    const dispatch = useAppDispatch()
    // @ts-ignore
    const user = useSelector((state) => state.profile)
    // @ts-ignore
    const projectState = useSelector((state) => state.projects)
    // @ts-ignore
    const shapesState = useSelector((state) => state.shapes)

    const createProject = async (name?: string) => {
        if (!user?.id) {
            toast.error("You must be logged in to create a project.")
            return 

        }
        dispatch(createProjectStart())
        try {
            const result = await fetchMutation(api.projects.createProject, {
                userId: user.id as Id<'users'>,
                name: name || "",
                sketchesData: {
                    shapes: shapesState.shapes,
                    tool: shapesState.tool,
                    selected: shapesState.selected,
                    frameCounter: shapesState.frameCounter,
                },
            })
            dispatch(addProject({
                _id: result.projectId,
                name: result.name,
                lastModified: `${Date.now()}`,
                createdAt: `${Date.now()}`,
                projectNumber: result.projectNumber,
            }))
            dispatch(createProjectSuccess())
            toast.success("Project created successfully!")
        } catch (error) {
            dispatch(createProjectFailure("Failed to create project. Please try again.")) 
            console.log(error)  
            toast.error("Failed to create project")       
        }
    }

    return {
        createProject,
        isCreating: projectState.isCreating,
        projects: projectState.projects,
        projectsTotal: projectState.total,
        canCreate: !!user.user,
    }
}