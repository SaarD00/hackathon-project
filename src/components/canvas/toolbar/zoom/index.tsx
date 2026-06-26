"use client"
import { Button } from '@/components/ui/button'
import { useCanvas } from '@/hooks/use-canvas'
import { setScale } from '@/redux/slice/viewport'
import { ZoomIn, ZoomOut } from 'lucide-react'
import React from 'react'
import { useDispatch } from 'react-redux'

const Zoom = () => {
    const dispatch = useDispatch()
    // TODO: zoom in zoom out infinity canvas functionality
    const { viewport } = useCanvas()

    // const { viewport, dispatch } = useCanvas()
    const handleZoomOut = () => {
        const newScale = Math.max(viewport.scale / 1.2, viewport.minScale)
        dispatch(setScale({ scale: newScale }))
    }
    const handleZoomIn = () => {
        const newScale = Math.min(viewport.scale * 1.2, viewport.maxScale)
        dispatch(setScale({ scale: newScale }))
    }
    return (
        <div className="flex items-center gap-1 backdrop-blur-xl bg-[#18181b]/90 border border-white/[0.12] rounded-full px-2 py-1 shadow-2xl">
            <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleZoomOut}
                    className="w-9 h-9 p-0 rounded-full cursor-pointer hover:bg-white/[0.12] border border-transparent hover:border-white/[0.16] transition-all"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4 text-primary/50" />
                </Button>
                <div className='text-center'>
                    <span className='text-sm font-mono leading-none text-primary/50'>{Math.round(viewport.scale * 100)}%</span>
                </div>
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleZoomIn}
                    className="w-9 h-9 p-0 rounded-full cursor-pointer hover:bg-white/[0.12] border border-transparent hover:border-white/[0.16] transition-all"
                    title="Zoom Out"
                >
                    <ZoomIn className="w-4 h-4 text-primary/50" />
                </Button>
        </div>
    )
}

export default Zoom
