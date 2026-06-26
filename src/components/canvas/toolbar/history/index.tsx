"use client"

import { Redo2, Undo2 } from 'lucide-react'
import React from 'react'

const History = () => {
    return (
        <div className='inline-flex items-center rounded-full backdrop-blur-xl bg-[#18181b]/90 border border-white/[0.12] p-1.5 text-neutral-300 shadow-2xl' aria-hidden>
            <span className='inline-grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.12] transition-all cursor-pointer'>
                    <Undo2 size={18} className='opacity-80 stroke-[1.75]' />
                </span>
                <span className='mx-1 h-5 w-px rounded bg-white/[0.16]'></span>
                <span className='inline-grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.12] transition-all cursor-pointer'>
                    <Redo2 size={18} className='opacity-80 stroke-[1.75]' />
                </span>

            </div>
    )
}

export default History
