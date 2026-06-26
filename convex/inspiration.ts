import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import {v} from "convex/values";

export const getInspirationImages = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, { projectId }) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error('Not authenticated')


        const project = await ctx.db.get(projectId)
        if (!project || project.userId !== userId) {
            return []
        }


        const storageIds = project.inspirationImages || []
        
        const images = await Promise.all(
            storageIds.map(async (storageId, index) => {
                try {
                    const url = await ctx.storage.getUrl(storageId)
                    return {
                        id: `inspiration-${storageId}`,
                        url,
                        storageId,
                        uploaded: true,
                        uploading: false,
                        index
                        
                    }
                } catch (error) {
                    console.error(`Error fetching URL for storage ID ${storageId}:`, error)
                    return null
                    
                }
            })
        )

        const validImages = images.filter((img) => img !== null).sort((a, b) => (a!.index - b!.index))

        return validImages
    }
        // Placeholder implementation - replace with actual logic to fetch inspiration images
})