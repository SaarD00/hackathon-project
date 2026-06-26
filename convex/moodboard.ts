import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import {v}  from "convex/values"

export const getMoodBoardImages = query({
    args:{projectId: v.id("projects")},
    handler: async (ctx, {projectId}) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error('Not authenticated')

        const project = await ctx.db.get(projectId)
        if (!project || project.userId !== userId) throw new Error('Project not found or access denied')

        const storageIds  = project.moodBoardImages || []
        // @ts-ignore
        const images = await Promise.all(storageIds.map(async (storageId: string) => {
            try {
                const url = await ctx.storage.getUrl(storageId)
                return {
                    id: `convex-${storageId}`,
                    storageId,
                    url,
                    uploaded: true,
                    uploading: false,
                    index: storageIds.indexOf(storageId)
                }
            } catch (error) {
                return null
                
            }

            


           
        }))
         return images.filter((img: any) => img !== null).sort((a: any, b: any) => (a!.index - b!.index)
        )
    },
})


export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error('Not authenticated')
        return await ctx.storage.generateUploadUrl()
    }
})


export const removeMoodBoardImage = mutation({
    args: {projectId: v.id("projects"), storageId: v.id("_storage")},
    handler: async (ctx, {projectId, storageId}) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error('Not authenticated')

        const project = await ctx.db.get(projectId)
        if (!project || project.userId !== userId) throw new Error('Project not found or access denied')

        const currentImages = project.moodBoardImages || []
        const updatedImages = currentImages.filter((id: string) => id !== storageId)

        await ctx.db.patch(projectId, {
            moodBoardImages: updatedImages,
            lastModified: Date.now(),
        })

        try {
            await ctx.storage.delete(storageId)
            
        } catch (error) {
            console.error(`Error deleting image from storage-id: ${storageId}`, error)
            
        }

        return { success: true , imageCount: updatedImages.length}

        }

        
            
})

export const addMoodBoardImage = mutation({
    args: {projectId: v.id("projects"), storageId: v.id("_storage")},
    handler: async (ctx, {projectId, storageId}) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error('Not authenticated')

        const project = await ctx.db.get(projectId)
        if (!project || project.userId !== userId) throw new Error('Project not found or access denied')

        const currentImages = project.moodBoardImages || []
        if (currentImages.length >= 10) {
            throw new Error('Maximum of 10 images allowed')
        }
        const updatedImages = [...currentImages, storageId]

        await ctx.db.patch(projectId, {
            moodBoardImages: updatedImages,
            lastModified: Date.now(),
        })  

        return { success: true , imageCount: updatedImages.length}
    }
})