import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { TextShape, updateShape } from '@/redux/slice/shapes'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { Bold, Italic, Palette, Strikethrough, Underline } from 'lucide-react'
import React, { useState } from 'react'

interface Props {
    isOpen: boolean
}

const TextSideBar = ({ isOpen }: Props) => {
    const dispatch = useAppDispatch()
    const selectedShapes = useAppSelector((state) => state.shapes.selected)
    const shapesEntities = useAppSelector((state) => state.shapes.shapes.entities)

    const selectedTextShape = Object.keys(selectedShapes)
        .map((id) => shapesEntities[id])
        .find((shape) => shape?.type === "text") as TextShape | undefined

    const [colorInput, setColorInput] = useState<string>("")

    // Sync state color when shape changes
    React.useEffect(() => {
        if (selectedTextShape?.fill) {
            setColorInput(selectedTextShape.fill)
        } else {
            setColorInput("#ffffff")
        }
    }, [selectedTextShape?.fill])

    const fontFamilies = [
        "Inter",
        "Roboto",
        "Open Sans",
        "Poppins",
        "Montserrat",
        "Lato",
        "Playfair Display",
        "Merriweather",
        "Lora",
        "Georgia",
        "JetBrains Mono",
        "Fira Code",
        "Source Code Pro",
        "Oswald",
        "Syncopate",
        "Bebas Neue"
    ];

    const updateTextProperty = (property: keyof TextShape, value: any) => {
        if (!selectedTextShape) return

        dispatch(
            updateShape({
                id: selectedTextShape.id,
                patch: { [property]: value },
            })
        )
    }

    // Handle color change with validation
    const handleColorChange = (color: string) => {
        setColorInput(color)
        if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
            updateTextProperty('fill', color)
        }
    }

    return (
        <div className={cn(
            "fixed right-2 top-1/2 transform -translate-y-1/2 w-80 backdrop-blur-xl bg-white/[0.12] border-white/[0.12] p-5 saturate-150 border rounded-xl z-50 transition-transform duration-300",
            isOpen ? "translate-x-0" : "translate-x-[calc(100%+20px)]"
        )}>
            {/* Title */}
            <div className="pb-3 mb-4 border-b border-white/[0.08]">
                <h4 className="text-white font-medium text-xs tracking-wide">Text Styling</h4>
            </div>

            <div className='flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-10rem)]'>
                {/* Font Family */}
                <div className='space-y-1.5'>
                    <Label className='text-xs text-white/60'>Font Family</Label>
                    <Select
                        value={selectedTextShape?.fontFamily || "Inter"}
                        onValueChange={(value) => updateTextProperty('fontFamily', value)}
                    >
                        <SelectTrigger className="bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.16] w-full text-white text-xs h-9 rounded-lg transition-all focus:ring-0 focus:ring-offset-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/10 rounded-lg">
                            {fontFamilies.map((font) => (
                                <SelectItem
                                    key={font}
                                    value={font}
                                    className="text-white text-xs hover:bg-white/10 focus:bg-white/10 rounded-md"
                                >
                                    <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Font Size */}
                <div className='space-y-1.5'>
                    <div className='flex justify-between items-center text-xs'>
                        <Label className='text-white/60'>Font Size</Label>
                        <span className="text-white/90 font-medium">{selectedTextShape?.fontSize || 16}px</span>
                    </div>
                    <Slider
                        value={[selectedTextShape?.fontSize || 16]}
                        onValueChange={([value]) => updateTextProperty('fontSize', value)}
                        min={8}
                        max={120}
                        step={1}
                        className='w-full cursor-pointer py-1'
                    />
                </div>

                {/* Font Weight */}
                <div className="space-y-1.5">
                    <div className='flex justify-between items-center text-xs'>
                        <Label className="text-white/60">Font Weight</Label>
                        <span className="text-white/90 font-medium">{selectedTextShape?.fontWeight || 400}</span>
                    </div>
                    <Slider
                        value={[selectedTextShape?.fontWeight || 400]}
                        onValueChange={([value]) => updateTextProperty('fontWeight', value)}
                        min={100}
                        max={900}
                        step={100}
                        className="w-full cursor-pointer py-1"
                    />
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Color</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={colorInput}
                                onChange={(e: any) => handleColorChange(e.target.value)}
                                placeholder="#ffffff"
                                className="bg-white/[0.04] border-white/[0.08] hover:border-white/[0.16] focus-visible:ring-1 focus-visible:ring-white/10 focus-visible:ring-offset-0 text-white text-xs h-9 pl-8 rounded-lg transition-colors font-mono"
                            />
                            <div
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-white/20 pointer-events-none"
                                style={{ backgroundColor: selectedTextShape?.fill || '#ffffff' }}
                            />
                        </div>
                        <button
                            className="px-3 h-9 rounded-lg border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white transition-colors"
                            onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'color'
                                input.value = selectedTextShape?.fill || '#ffffff'
                                input.onchange = (e) => {
                                    const color = (e.target as HTMLInputElement).value
                                    setColorInput(color)
                                    updateTextProperty('fill', color)
                                }
                                input.click()
                            }}
                        >
                            Pick
                        </button>
                    </div>
                </div>

                {/* Text Styles */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Style</Label>
                    <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.08] w-fit">
                        <Toggle
                            pressed={selectedTextShape ? selectedTextShape.fontWeight >= 600 : false}
                            onPressedChange={(pressed) =>
                                updateTextProperty("fontWeight", pressed ? 700 : 400)
                            }
                            className="data-[state=on]:bg-white/[0.08] data-[state=on]:text-white text-white/50 hover:bg-white/[0.04] hover:text-white rounded-md h-7 w-7 p-0 transition-all focus-visible:ring-0"
                        >
                            <Bold className="w-3.5 h-3.5" />
                        </Toggle>

                        <Toggle
                            pressed={selectedTextShape?.fontStyle === "italic"}
                            onPressedChange={(pressed) =>
                                updateTextProperty("fontStyle", pressed ? "italic" : "normal")
                            }
                            className="data-[state=on]:bg-white/[0.08] data-[state=on]:text-white text-white/50 hover:bg-white/[0.04] hover:text-white rounded-md h-7 w-7 p-0 transition-all focus-visible:ring-0"
                        >
                            <Italic className="w-3.5 h-3.5" />
                        </Toggle>

                        <Toggle
                            pressed={selectedTextShape?.textDecoration === "underline"}
                            onPressedChange={(pressed) =>
                                updateTextProperty("textDecoration", pressed ? "underline" : "none")
                            }
                            className="data-[state=on]:bg-white/[0.08] data-[state=on]:text-white text-white/50 hover:bg-white/[0.04] hover:text-white rounded-md h-7 w-7 p-0 transition-all focus-visible:ring-0"
                        >
                            <Underline className="w-3.5 h-3.5" />
                        </Toggle>

                        <Toggle
                            pressed={selectedTextShape?.textDecoration === "line-through"}
                            onPressedChange={(pressed) =>
                                updateTextProperty("textDecoration", pressed ? "line-through" : "none")
                            }
                            className="data-[state=on]:bg-white/[0.08] data-[state=on]:text-white text-white/50 hover:bg-white/[0.04] hover:text-white rounded-md h-7 w-7 p-0 transition-all focus-visible:ring-0"
                        >
                            <Strikethrough className="w-3.5 h-3.5" />
                        </Toggle>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TextSideBar;