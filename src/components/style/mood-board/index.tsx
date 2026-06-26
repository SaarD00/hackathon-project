"use client"

import { MoodBoardImage, useMoodBoard } from "@/hooks/use-styles"
import { cn } from "@/lib/utils"
import React, { useRef } from "react"
import ImagesBoard from "./images.board"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import StyleGuideButton from "@/components/buttons/style-guide"

type Props = {
    guideImages: MoodBoardImage[]
}

const MoodBoard = ({ guideImages }: Props) => {
    const { images, dragActive, removeImage, addImage, canAddMore, handleDrop, handlerDrag, hanndleFileInput } = useMoodBoard(guideImages)
    const searchParams = useSearchParams()
    const projectId = searchParams.get("project")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }
    return (
        <div className="flex flex-col gap-10">
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 min-h-[400px] flex items-center justify-center',
                    dragActive
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-border/50 hover:border-border'
                )}
                onDragEnter={handlerDrag}
                onDragLeave={handlerDrag}
                onDragOver={handlerDrag}
                onDrop={handleDrop}
            >
                {/* Image upload contents can go here */}
                <div className=" absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-3xl" />
                </div>
                <div className="lg:hidden absolute inset-0 flex items-center justify-center">
                    <div className="relative">


                        {images.map((image, index) => {
                            const seed = image.id
                                .split('')
                                .reduce((a, b) => a + b.charCodeAt(0), 0)

                            const random1 = ((seed * 9301 + 49297) % 233280) / 233280
                            const random2 = (((seed + 1) * 9301 + 49297) % 233280) / 233280
                            const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280

                            const xOffset = random2 * 100
                            const rotation = (random1 - 0.5) * 20
                            const yOffset = (random3 - 0.5) * 40

                            return (
                                <ImagesBoard key={`mobile-${image.id}`} image={image} marginLeft="-80px" marginTop="-96px" removeImage={removeImage} xOffset={xOffset} yOffset={yOffset} rotation={rotation} zIndex={index + 1} />

                            )
                        })}
                    </div>
                </div>
                <div className="hidden lg:flex absolute inset-0 items-center justify-center">
                    <div className="relative w-full max-w-[700px] h-[300px] mx-auto">
                        {images.map((image, index) => {
                            const seed = image.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
                            const random1 = ((seed * 9301 + 49297) % 233280) / 233280
                            const random2 = (((seed + 1) * 9301 + 49297) % 233280) / 233280
                            const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280

                            const imageWidth = 176
                            const overlapAmount = 40 // Tighter overlap reveals more of each composition
                            const spacing = imageWidth - overlapAmount

                            // Precise, beautiful canvas distribution
                            const baseLeftOffset = index * spacing - ((images.length - 1) * spacing) / 2

                            // Alternating wave patterns for organic vertical placement
                            const wave = Math.sin(index * 1.8)
                            const cosWave = Math.cos(index * 1.5)

                            // Controlled organic offsets
                            const xOffset = baseLeftOffset + (cosWave * 6)
                            const yOffset = wave * 22 // Gentle rhythm up and down across the line
                            const rotation = wave * 12 // Keeps angles elegant (max ~12 deg)
                            return (
                                <ImagesBoard key={`mobile-${image.id}`} image={image} marginLeft="-96px" marginTop="-112px" removeImage={removeImage} xOffset={xOffset} yOffset={yOffset} rotation={rotation} zIndex={index + 1} />

                            )
                        })}
                    </div>

                </div>

                {images.length === 0 && (
                    <div className="relative z-10 space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-foreground">
                                Drop your images here
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Drag and drop up to 5 images to build your mood board
                            </p>
                        </div>

                        <Button onClick={handleUploadClick} variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Files
                        </Button>
                    </div>
                )}

                {images.length > 0 && canAddMore && (
                    <div className="absolute bottom-6 right-6 z-20">
                        <Button onClick={handleUploadClick} size="sm" variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Add More
                        </Button>
                    </div>
                )}


                <input ref={fileInputRef} className="hidden" onChange={hanndleFileInput} multiple type="file" accept="image/*" ></input>


            </div>
            <StyleGuideButton images={images} fileInputRef={fileInputRef} projectId={projectId || ""} />

        </div>
    )
}

export default MoodBoard