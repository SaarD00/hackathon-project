"use client"

import { useMutation } from "convex/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { api } from "../../convex/_generated/api"
import { toast } from "sonner"
import { Id } from "../../convex/_generated/dataModel"
import { useGenerateStyleGuideMutation } from "@/redux/api/style-guide"
import { useRouter } from "next/navigation"
import { GeneratedUIShape, updateShape } from "@/redux/slice/shapes"
import { useAppDispatch } from "@/redux/store"

export interface MoodBoardImage {
  id: string
  file?: File // Optional for server-loaded images
  preview: string // Local preview URL or Convex URL
  storageId?: string
  uploaded: boolean
  uploading: boolean
  error?: string
  url?: string // Convex URL for uploaded images
  isFromServer?: boolean // Track if image came from server
}

interface StylesFormData {
  images: MoodBoardImage[]
}

export const useMoodBoard = (guidedImages: MoodBoardImage[]) => {
  const  [dragActive, setDragActive] = useState(false)
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  const form = useForm<StylesFormData>({
    defaultValues: {
      images: [],
    }
  })
  const {watch, setValue, getValues} = form
  const images = watch("images")

  const generateUploadUrl = useMutation(api.moodboard.generateUploadUrl)
  const removeMoodBoardImage = useMutation(api.moodboard.removeMoodBoardImage)

  const addMoodBoardImage = useMutation(api.moodboard.addMoodBoardImage)


  const uploadImageToConvex = async (file: File): Promise<{storageId: string, url?: string}> => {
    try {
        const uploadUrl = await generateUploadUrl()
    const result = await fetch(uploadUrl, {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })
    if (!result.ok) {
      throw new Error("Failed to upload image")
    }
    const {storageId} = await result.json()
    if (projectId) {
      await addMoodBoardImage({
        projectId: projectId as Id<"projects">,
        storageId: storageId as Id<"_storage">
      })
    

    }

    return {storageId}
      
    } catch (error) {
      console.error("Error uploading image to Convex", error)
      throw error
      
    }
  
    

  }
  

  useEffect(() => {
    if (guidedImages && guidedImages.length > 0) {
      const serverImages: MoodBoardImage[] = guidedImages.map((img: any) => ({
       id: img.id,
       preview: img.url,
       uploaded: true,
       uploading: false,
       url  : img.url,
      isFromServer: true,
      storageId: img.storageId,


      }));
    const currentImages = getValues("images") || []
    if (currentImages.length === 0) {
      setValue("images", serverImages) 
    } else {
      const merged =[...currentImages]
      serverImages.forEach((serverImg) => {
       const clientIndex = merged.findIndex((img) => img.id === serverImg.id)
       if (clientIndex === -1) {
        if (merged[clientIndex].preview.startsWith("blob:")) {
          URL.revokeObjectURL(merged[clientIndex].preview)
        }    
        merged[clientIndex] = serverImg      
              }
      })
      setValue("images", merged)
    }

    }
  }, [guidedImages, setValue, getValues])


  const addImage = (file: File) => {
    if (images.length >= 10) {
      toast.error("Maximum of 10 images allowed")
      return
    }

    const newImage: MoodBoardImage = {
      id: `${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      uploading: false,
      isFromServer: false,
    }
    const updatedImages = [...images, newImage]
    setValue("images", updatedImages)

    toast.success("Image added to mood board")
  }

  const removeImage = async (id: string) => {
    const imageToRemove = images.find((img) => img.id === id)
    if (!imageToRemove) return

    if (imageToRemove.isFromServer && imageToRemove.storageId && projectId) {
      try {
        await removeMoodBoardImage({projectId: projectId as Id<"projects">, storageId: imageToRemove.storageId as Id<"_storage">})
        toast.success("Image removed from mood board")
        
      } catch (error) {
        console.error("Error removing image from mood board", error)
        toast.error("Failed to remove image from mood board")
      }
    }

    const updatedImages = images.filter((img) => {
      if (img.id === id) {
        if (!img.isFromServer && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview)
        }
        return false
      }
      return true
    })

    setValue("images", updatedImages)
    toast.success("Image removed from mood board")

  }

  const handlerDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      toast.error("Please drop valid image files")
      return
    }

    imageFiles.forEach((file) => {
      if (images.length < 10) {
        addImage(file)
      }
        else {toast.error("Maximum of 10 images allowed")
        return
      }
    })
    
  }

  const hanndleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => addImage(file))

    e.target.value = ""
  }

  useEffect(() => {
    const uploadPending = async () => {
      const currentImages = getValues("images") || []
      for (let i = 0; i < currentImages.length; i++) {
        const image = currentImages[i]
        if (!image.uploaded && !image.uploading && !image.error) {
          const updatedImage = [...currentImages]
          updatedImage[i] = {...image, uploading: false}
          setValue("images", updatedImage)

          try {
            const {storageId} = await uploadImageToConvex(image.file as File)
            const finalImages = getValues("images")
            const finaIndex = finalImages.findIndex((img) => img.id === image.id)

            if (finaIndex !== -1) {
              finalImages[finaIndex] = {
                ...finalImages[finaIndex],
                uploaded: true,
                uploading: false,
                storageId,
                isFromServer: true,
              }
              setValue("images", finalImages)
            }
            
          } catch (error) {
            console.error("Error uploading image", error)
            const errorImage = getValues("images")
            const errorIndex = errorImage.findIndex((img) => img.id === image.id)

            if (errorIndex !== -1) {
              errorImage[errorIndex] = {
                ...errorImage[errorIndex],
                uploading: false,
                error: "Failed to upload",
              }
              setValue("images", [...errorImage])
            }

            
          }
        }
      }
    }


    if (images.length > 0) {
      uploadPending()
    }
  }, [images, getValues, setValue])

  useEffect(() => {
    return () => {
      images.forEach((img) => {
          URL.revokeObjectURL(img.preview)
      })
    }
  }, [])




  return {
    images,
    addImage,
    removeImage,
    handlerDrag,
    handleDrop,
    hanndleFileInput,
    dragActive,
    canAddMore: images.length < 10,
  }

  


}


export const useStyleGuide = (projectId: string, images: MoodBoardImage[], fileInputRef: React.RefObject<HTMLInputElement | null>) => {
  const [generateStyleGuide, {isLoading: isGenerating}] = useGenerateStyleGuideMutation()
  const router = useRouter()
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleGenerateStyleGuide = async () => {
    if (!projectId) {
      toast.error("Project ID is missing")
      return
    }
    if (images.length === 0) {
      toast.error("Please add images to the mood board before generating the style guide")
      return
    }
    if (images.some((img) => img.uploading)) {
      toast.error("Please wait for all images to finish uploading before generating the style guide")
      return
    }

    try {
      toast.loading("Generating style guide...", {id: "style-guide-gen"})
      const result = await generateStyleGuide({projectId}).unwrap()

      if (result.success) {
        toast.success(result.message, {id: "style-guide-gen"})
        router.push(`/style-guide?project=${projectId}`)
      }
      else {
          toast.error("Failed to generate style guide", {id: "style-guide-gen"})
        }

      
    } catch (error) {
      console.error("Error generating style guide", error)
      toast.error("An error occurred while generating the style guide", {id: "style-guide-gen"})
      
    }
  }
  return {
    handleGenerateStyleGuide,
    isGenerating,
    handleUploadClick,
  }
}




export const useUpdateCont = (shape: GeneratedUIShape) => {
  const dispatch = useAppDispatch()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
  if (containerRef.current && shape.uiSpecData) {
    const timeoutId = setTimeout(() => {
      const actualHeight = containerRef.current?.offsetHeight || 0;
      if (actualHeight > 0 && Math.abs(actualHeight - shape.h) > 10) { 
        dispatch(
          updateShape({
            id: shape.id,
            patch: { h: actualHeight },
          })
        )
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }
}, [shape.uiSpecData, shape.id, shape.h, dispatch]) // Note: The dependency array is partially cut off at the bottom right

// Enhanced HTML sanitization function for basic safety
const sanitizeHtml = (html: string) => {
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols for safety

  return sanitized
}

return { sanitizeHtml , containerRef }

}