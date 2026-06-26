"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Plus, Mic, ArrowUp, ChevronDown, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCanvas, useFrame } from '@/hooks/use-canvas'

const PromptWindow = () => {
    const { selectedShapes, shapes } = useCanvas()
    const [inputValue, setInputValue] = useState('')
    const [selectedModel, setSelectedModel] = useState<'3.1 Pro' | '3 Flash'>('3.1 Pro')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedIds = Object.keys(selectedShapes)
    const selectedShape = selectedIds.length === 1 ? shapes.find(s => s.id === selectedIds[0]) : undefined
    const isFrameSelected = selectedShape?.type === "frame"
    const isGeneratedUISelected = selectedShape?.type === "generatedui"
    const isPromptable = isFrameSelected || isGeneratedUISelected

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // @ts-ignore
    const { handleGenerateDesign, isGenerating } = useFrame(isPromptable ? selectedShape : undefined)

    const handleSubmit = async () => {
        if (isPromptable && inputValue.trim()) {
            await handleGenerateDesign(inputValue.trim())
            setInputValue('')
        }
    }

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 w-[550px] ${isPromptable ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
            <div className="bg-[#18181b]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col">
                <div className="px-4 py-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                        placeholder={isFrameSelected ? "What would you like to change or create in this frame?" : isGeneratedUISelected ? "How would you like to refine this design?" : "Select a frame or generated UI to prompt..."}
                        className="w-full bg-transparent text-white/90 placeholder:text-neutral-500 outline-none text-[15px]"
                        disabled={!isPromptable || isGenerating}
                    />
                </div>

                <div className="px-3 pb-3 flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/[0.12] text-white/70">
                            <Plus className="w-4 h-4" />
                        </Button>
                        <div className="w-8 h-8 flex items-center justify-center text-white/40 text-lg font-medium cursor-pointer hover:text-white/70 transition-colors">
                            /
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => isPromptable && !isGenerating && setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors border border-transparent select-none
                                    ${isPromptable && !isGenerating
                                        ? 'hover:bg-white/[0.12] cursor-pointer hover:border-white/[0.08]'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${selectedModel === '3.1 Pro'
                                    ? 'from-blue-500 to-orange-400'
                                    : 'from-blue-500 to-pink-400'
                                    }`} />
                                <span className="text-white/80 text-sm font-medium">{selectedModel}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-44 bg-[#1f1f23]/95 backdrop-blur-xl border border-white/[0.12] rounded-xl shadow-xl overflow-hidden py-1 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-150">
                                    <div
                                        onClick={() => {
                                            setSelectedModel('3.1 Pro')
                                            setIsDropdownOpen(false)
                                        }}
                                        className="flex items-center justify-between px-3 py-2 text-sm text-white/85 hover:bg-white/[0.08] cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-blue-500 to-orange-400" />
                                            <span>3.1 Pro</span>
                                        </div>
                                        {selectedModel === '3.1 Pro' && <Check className="w-4 h-4 text-blue-400" />}
                                    </div>
                                    <div
                                        onClick={() => {
                                            setSelectedModel('3 Flash')
                                            setIsDropdownOpen(false)
                                        }}
                                        className="flex items-center justify-between px-3 py-2 text-sm text-white/85 hover:bg-white/[0.08] cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500" />
                                            <span>3 Flash</span>
                                        </div>
                                        {selectedModel === '3 Flash' && <Check className="w-4 h-4 text-amber-400" />}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/[0.12] text-white/70">
                            <Mic className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-white/[0.12] text-white/70"
                            onClick={handleSubmit}
                            disabled={!isPromptable || !inputValue.trim() || isGenerating}
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ArrowUp className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PromptWindow
