import { Shape } from '@/redux/slice/shapes'
// import { Frame } from 'lucide-react'
import React from 'react'
import { Frame } from './frame'
import { Elipse } from './elipse'
import { Rectangle } from './rectangle'
import { Stroke } from './stroke'
import { Arrow } from './arrow'
import { Line } from './line'
import { Text } from './text'
import GeneratedUi from './generated'



const ShapeRenderer = ({
    shape,
    toggleChat,
    generateWorkflow,
    exportDesign,
}: {
    shape: Shape
    toggleChat?: (generatedUIId: string) => void
    generateWorkflow?: (generatedUIId: string) => void
    exportDesign?: (generatedUIId: string, htmlContent: string) => void
}) => {
    switch (shape.type) {
        case 'frame':
            return (
                <Frame shape={shape} />
            )
        case 'rect':
            return <Rectangle shape={shape} />
        case 'ellipse':
            return <Elipse shape={shape} />
        case 'freedraw':
            return <Stroke shape={shape} />
        case 'arrow':
            return <Arrow shape={shape} />
        case 'line':
            return <Line shape={shape} />
        case 'text':
            return <Text shape={shape} />
        case 'generatedui':
            return (
                <GeneratedUi exportDesign={exportDesign} generateWorkflow={generateWorkflow} shape={shape} toggleChat={toggleChat} />
            )
        default:
            return null
    }
}

export default ShapeRenderer
