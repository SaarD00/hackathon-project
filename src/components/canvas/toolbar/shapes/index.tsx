"use client"


import { Button } from '@/components/ui/button'
import { useCanvas } from '@/hooks/use-canvas'
import { cn } from '@/lib/utils'
import { Tool } from '@/redux/slice/shapes'
import { ArrowUpRight, Circle, Eraser, Hash, Minus, MousePointer2, Pencil, Square, Type } from 'lucide-react'
import React from 'react'

const tools: Array<{
  id: Tool
  icon: React.ReactNode
  label: string
  description: string
}> = [
    {
      id: 'select',
      icon: <MousePointer2 className="w-4 h-4" />,
      label: 'Select',
      description: 'Select and move shapes',
    },
    {
      id: 'frame',
      icon: <Hash className="w-4 h-4" />,
      label: 'Frame',
      description: 'Draw frame containers',
    },
    {
      id: 'rect',
      icon: <Square className="w-4 h-4" />,
      label: 'Rectangle',
      description: 'Draw rectangles',
    },
    {
      id: 'ellipse',
      icon: <Circle className="w-4 h-4" />,
      label: 'Ellipse',
      description: 'Draw ellipses or circles',
    },
    {
      id: 'freedraw',
      icon: <Pencil className="w-4 h-4" />,
      label: 'Draw',
      description: 'Freehand drawing and scribbling',
    },
    {
      id: 'arrow',
      icon: <ArrowUpRight className="w-4 h-4" />,
      label: 'Arrow',
      description: 'Draw pointing arrows',
    },
    {
      id: 'line',
      icon: <Minus className="w-4 h-4" />,
      label: 'Line',
      description: 'Draw straight lines',
    },
    {
      id: 'text',
      icon: <Type className="w-4 h-4" />,
      label: 'Text',
      description: 'Add text to the canvas',
    },
    {
      id: 'eraser',
      icon: <Eraser className="w-4 h-4" />,
      label: 'eraser',
      description: 'Erase elements from the canvas',
    }

  ]

const ToolBarShapes = () => {
  const { currentTool, selectTool } = useCanvas()
  return (
    <div className="flex flex-col items-center backdrop-blur-xl   bg-white/[0.08] border border-white/[0.12] gap-2 rounded-full p-2 shadow-2xl">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={'ghost'}
          size="lg"
          onClick={() => selectTool(tool.id)}
          className={cn(
            'cursor-pointer rounded-full w-11 h-11 p-0 flex items-center justify-center transition-all',
            currentTool === tool.id
              ? 'text-white bg-white/[0.12] border border-white/[0.16]'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
          )}
          title={`${tool.label} - ${tool.description}`}
        >
          {tool.icon}
        </Button>
      ))}
    </div>
  )
}

export default ToolBarShapes
