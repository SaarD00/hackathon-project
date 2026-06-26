// src/inngest/functions.ts
import { fetchMutation } from "convex/nextjs";
import { inngest } from "./client";
import { api } from "../../convex/_generated/api";

export const autosaveProjectWorkflow = inngest.createFunction(
  { id: "autosave-project-workflow", triggers: { event: "project/autosave.requested" } },
  async ({ event, step }) => {
    // const result = await step.run("handle-task", async () => {
    //   return { processed: true, id: event.data.id };
    // });
    // return { message: `Task ${event.data.id} complete`, result };

    const {projectId, shapesData, viewportData} = event.data
    try {
      await fetchMutation(api.projects.updateProject, {
        projectId,
        sketchesData: shapesData,
        viewportData:   viewportData
      })

      return { message: `Project ${projectId} autosaved successfully`, success: true };
      
    } catch (error) {
      return { message: `Failed to autosave project ${projectId}`, success: false };
    }
  }
);