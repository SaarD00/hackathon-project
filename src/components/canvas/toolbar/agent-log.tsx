"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Rocket } from 'lucide-react'

const AgentLogButton = () => {
    return (
        <Button variant="secondary" className="rounded-full bg-[#18181b] border border-white/[0.12] text-white/90 px-4 py-6 gap-3 hover:bg-[#27272a]">
            <Rocket className="w-4 h-4" />
            Agent log
            <ChevronDown className="w-4 h-4 text-white/50" />
        </Button>
    )
}

export default AgentLogButton
