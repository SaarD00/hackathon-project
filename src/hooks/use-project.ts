"use client"

import { addProject, createProjectFailure, createProjectStart, createProjectSuccess } from "@/redux/slice/projects"
import { useAppDispatch } from "@/redux/store"
import { fetchMutation } from "convex/nextjs"
import { stat } from "fs"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"


const generateGradientThumbnail = (name?: string) => {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  ];

  const randomGradient =
    gradients[Math.floor(Math.random() * gradients.length)];

  const initial = name ? name.trim().charAt(0).toUpperCase() : "";

  const svgContent = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${
            randomGradient.match(/#[a-fA-F0-9]{6}/g)?.[0] || "#667eea"
          }" />
          <stop offset="100%" style="stop-color:${
            randomGradient.match(/#[a-fA-F0-9]{6}/g)?.[1] || "#764ba2"
          }" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      ${initial ? `
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="white" opacity="0.85">
        ${initial}
      </text>
      ` : ""}
    </svg>
  `;

  // Safely encode to base64 supporting unicode character names
  const utf8Svg = unescape(encodeURIComponent(svgContent));
  return `data:image/svg+xml;base64,${btoa(utf8Svg)}`;
};

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
            const thumbnail =  generateGradientThumbnail(name)

            const result = await fetchMutation(api.projects.createProject, {
                userId: user.id as Id<'users'>,
                name: name || "",
                sketchesData: {
                    shapes: shapesState.shapes,
                    tool: shapesState.tool,
                    selected: shapesState.selected,
                    frameCounter: shapesState.frameCounter,
                },
                thumbnail
            })
            dispatch(addProject({
                _id: result.projectId,
                name: result.name,
                thumbnail,
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