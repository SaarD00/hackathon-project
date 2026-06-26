"use client"

import { Redo2, Undo2 } from 'lucide-react'
import React from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { undo, redo } from '@/redux/slice/shapes'

const History = () => {
    const dispatch = useAppDispatch()
    const canUndo = useAppSelector((state) => state.shapes.past.length > 0)
    const canRedo = useAppSelector((state) => state.shapes.future.length > 0)

    return (
        <div className='inline-flex items-center rounded-full backdrop-blur-xl bg-[#18181b]/90 border border-white/[0.12] p-1.5 text-neutral-300 shadow-2xl' aria-hidden>
            <span 
                onClick={() => { if (canUndo) dispatch(undo()) }}
                className={`inline-grid h-9 w-9 place-items-center rounded-full transition-all cursor-pointer ${canUndo ? 'hover:bg-white/[0.12]' : 'opacity-30 cursor-not-allowed'}`}
            >
                <Undo2 size={18} className='opacity-80 stroke-[1.75]' />
            </span>
            <span className='mx-1 h-5 w-px rounded bg-white/[0.16]'></span>
            <span 
                onClick={() => { if (canRedo) dispatch(redo()) }}
                className={`inline-grid h-9 w-9 place-items-center rounded-full transition-all cursor-pointer ${canRedo ? 'hover:bg-white/[0.12]' : 'opacity-30 cursor-not-allowed'}`}
            >
                <Redo2 size={18} className='opacity-80 stroke-[1.75]' />
            </span>
        </div>
    )
}

export default History
