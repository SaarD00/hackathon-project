import { ChevronDown, Type } from 'lucide-react'
import React from 'react'

type Props = {
    typographyGuide: any
}

const StyleGuideTypography = ({ typographyGuide }: Props) => {
    // Empty state handler
    console.log("typogrpahyyy", typographyGuide)
    if (!typographyGuide || typographyGuide.length === 0) {
        return (
            <div className='text-center py-20 bg-[#0c0c0e] rounded-3xl border border-white/[0.05]'>
                <Type className='w-16 h-16 mx-auto mb-4 text-muted-foreground' />
                <h3 className='text-lg font-medium text-white mb-2'>No typography generated yet</h3>
                <p className='text-sm text-zinc-400 mb-6 max-w-sm mx-auto'>
                    Generate a style guide to see typography recommendations
                </p>
            </div>
        )
    }

    // Safely reads the font family name from the dynamic data array for the selector text
    const activeFontFamily = typographyGuide[0]?.styles?.[0]?.fontFamily?.split(',')[0] || 'Manrope'


    return (
        <div className='space-y-6 text-left w-full max-w-4xl'>
            {/* Font selector layout block */}
            <div className='space-y-2'>
                <span className='text-xs font-normal text-zinc-500 tracking-wide uppercase'>Font</span>
                <div className='flex items-center gap-3 bg-[#121214] border border-white/[0.06] rounded-xl px-4 py-3 w-full max-w-xs cursor-pointer hover:bg-[#161619] transition-all'>
                    <span className='text-zinc-400 font-medium text-sm'>Aa</span>
                    <span className='text-sm font-medium text-zinc-200 flex-1'>
                        {activeFontFamily.replace(/['"]/g, '')}
                    </span>
                    <ChevronDown className='w-4 h-4 text-zinc-500' />
                </div>
            </div>

            <div className='flex flex-col gap-3 px-2 pb-4'>
                {typographyGuide.map((section: any) =>
                    section.styles?.map((style: any, idx: number) => (
                        <div
                            key={`${section.title}-${idx}`}
                            className='flex flex-col gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group'
                        >
                            <div className='flex items-baseline gap-2 mb-1'>
                                <span className='text-sm font-medium text-white/90'>
                                    {style.name}
                                </span>
                                {style.description && (
                                    <span className="text-xs text-white/40 font-light hidden sm:inline-block">
                                        • {style.description}
                                    </span>
                                )}
                            </div>

                            <div
                                className='text-white/80 tracking-normal leading-tight break-words group-hover:text-white transition-colors'
                                style={{
                                    fontFamily: style.fontFamily,
                                    fontSize: style.fontSize || '1rem',
                                    fontWeight: style.fontWeight,
                                    lineHeight: style.lineHeight,
                                    letterSpacing: style.letterSpacing
                                }}
                            >
                                Whereas disregard and contempt for human rights have resulted
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default StyleGuideTypography