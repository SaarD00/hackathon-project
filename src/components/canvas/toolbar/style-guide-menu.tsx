"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, Palette, Type, Image as ImageIcon, Rocket } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeContent } from '@/components/style/theme'
import StyleGuideTypography from '@/components/style/typography'
import MoodBoard from '@/components/style/mood-board'

type Props = {
    colorGuide: any;
    typoGraphyGuide: any;
    guideImages: any;
}

const StyleGuideMenu = ({ colorGuide, typoGraphyGuide, guideImages }: Props) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="secondary" className="rounded-full bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] text-white/90 px-4 py-6 gap-3 hover:bg-white/[0.06] hover:border-white/[0.15] shadow-[0_8px_32px_0_rgba(0,0,0,0.36),inset_0_1px_1px_0_rgba(255,255,255,0.1)] transition-all duration-500 ease-out">
                    <Rocket className="w-4 h-4" />
                    Style Guide
                    <ChevronUp className="w-4 h-4 text-white/50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={16} className="w-[500px] p-0 bg-white/[0.05] backdrop-blur-[40px] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.36),inset_0_1px_1px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/[0.05] overflow-hidden">
                <Tabs defaultValue="colours" className="w-full">
                    <div className="p-2 border-b border-white/[0.08]">
                        <TabsList className="w-full bg-transparent p-0 flex justify-start gap-2 h-auto">
                            <TabsTrigger value="colours" className="data-[state=active]:bg-white/[0.12] data-[state=active]:text-white text-white/60 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm h-auto transition-all">
                                <Palette className="w-4 h-4" />
                                Colours
                            </TabsTrigger>
                            <TabsTrigger value="typography" className="data-[state=active]:bg-white/[0.12] data-[state=active]:text-white text-white/60 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm h-auto transition-all">
                                <Type className="w-4 h-4" />
                                Typography
                            </TabsTrigger>
                            <TabsTrigger value="moodboard" className="data-[state=active]:bg-white/[0.12] data-[state=active]:text-white text-white/60 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm h-auto transition-all">
                                <ImageIcon className="w-4 h-4" />
                                Mood Board
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 max-h-[500px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <TabsContent value='colours' className='mt-0 space-y-8'>
                            {!colorGuide ? (
                                <div className="space-y-8">
                                    <div className="text-center py-20">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-white/[0.08] flex items-center justify-center">
                                            <Palette className="w-8 h-8 text-white/50" />
                                        </div>
                                        <h3 className="text-lg font-light text-white/90 mb-2">
                                            No colors generated yet
                                        </h3>
                                        <p className="text-sm text-white/50 font-light max-w-md mx-auto mb-6">
                                            Upload images to your mood board and generate an AI-powered style guide with colors and typography.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <ThemeContent colorGuide={colorGuide} />
                            )}
                        </TabsContent>

                        <TabsContent value='typography' className='mt-0'>
                            <StyleGuideTypography typographyGuide={typoGraphyGuide} />
                        </TabsContent>

                        <TabsContent value='moodboard' className='mt-0'>
                            <MoodBoard guideImages={guideImages} />
                        </TabsContent>
                    </div>
                </Tabs>
            </PopoverContent>
        </Popover>
    )
}

export default StyleGuideMenu
