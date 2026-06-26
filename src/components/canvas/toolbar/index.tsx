import React from 'react'
import History from './history'
import Zoom from './zoom'
import ToolBarShapes from './shapes'
import StyleGuideMenu from './style-guide-menu'
import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
    colorGuide: any;
    typoGraphyGuide: any;
    guideImages: any;
}

const ToolBar = ({ colorGuide, typoGraphyGuide, guideImages }: Props) => {
    return (
        <div className='pointer-events-none  fixed inset-0 z-40'>
            {/* Left vertical toolbar */}
            <div className='absolute left-5  top-1/2 -translate-y-1/2 pointer-events-auto'>
                <ToolBarShapes />
            </div>

            {/* Bottom left Style Guide Menu */}
            <div className='absolute bottom-5 left-5 pointer-events-auto'>
                <StyleGuideMenu colorGuide={colorGuide} typoGraphyGuide={typoGraphyGuide} guideImages={guideImages} />
            </div>

            {/* Bottom right history and zoom */}
            <div className='absolute bottom-5 right-5 flex items-center gap-4 pointer-events-auto'>
                <History />
                <Zoom />
                <Button variant="ghost" size="icon" className="w-11 h-11 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-xl hover:bg-white/[0.12] text-white">
                    <CircleHelp className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

export default ToolBar
