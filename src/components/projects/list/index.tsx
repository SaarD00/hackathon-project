'use client'
import { useProjectCreation } from '@/hooks/use-project'
import { useAppSelector } from '@/redux/store'
import { formatDistanceToNow } from 'date-fns'
import { Plus, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const ProjectsList = () => {
    const { projects, canCreate } = useProjectCreation()
    const user = useAppSelector((state) => state.profile)

    // Sort projects by creation/modification date descending (newest first)
    const sortedProjects = [...projects].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.lastModified || 0).getTime();
        const timeB = new Date(b.createdAt || b.lastModified || 0).getTime();
        return timeB - timeA;
    });

    const latestProject = sortedProjects[0] || null;

    // Ticking state to safely update relative timestamps on the client side
    const [timeKey, setTimeKey] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeKey((prev) => prev + 1)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className='space-y-8 max-w-[1400px] mx-auto px-4 md:px-0'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-baseline justify-between  border-neutral-200/10  gap-2'>
                <div>
                    <h1 className='text-2xl font-medium tracking-tight text-neutral-100'>Welcome {user.name}</h1>
                    <p className='text-sm text-neutral-400 mt-1 font-normal tracking-wide'>
                        Never lose your momentum. Your design canvas, exactly how you left it.
                    </p>
                </div>
            </div>
            <hr className='w-full pb-5 text-white '></hr>

            {/* Conditional Rendering for Projects */}
            {projects.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-sm">
                        <Plus className="w-5 h-5 text-neutral-400" />
                    </div>
                    <h3 className="text-sm font-medium text-neutral-200 mb-1">
                        No projects yet
                    </h3>
                    <p className="text-xs text-neutral-500 mb-5">
                        Create your first project to get started
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-12 gap-y-10'>
                    {sortedProjects.map((project: any) => {
                        const isLatest = latestProject && project._id === latestProject._id;
                        return (
                            <Link
                                key={project._id}
                                href={`/dashboard/${user?.name}/canvas?project=${project._id}`}
                                className='group cursor-pointer scale-110 block no-underline'
                            >
                                <div className='space-y-3  transition-all duration-300 ease-out transform group-hover:-translate-y-1'>
                                    {/* Predefined glassmorphism card preview */}
                                    <div className={`aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950/40 backdrop-blur-md border relative shadow-sm group-hover:shadow-md transition-all duration-300 ease-out flex items-center justify-center ${
                                        isLatest
                                            ? 'border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.12)] group-hover:border-indigo-500/60'
                                            : 'border-neutral-800/60 group-hover:border-neutral-700/50'
                                    }`}>
                                        {/* Premium "Recent" badge on the top right */}
                                        {isLatest && (
                                            <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-md shadow-sm">
                                                <span className="relative flex h-1 w-1">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1 w-1 bg-indigo-500"></span>
                                                </span>
                                                Recent
                                            </span>
                                        )}

                                        {/* Subtly designed mini-canvas schematic */}
                                        <div className="absolute inset-0 p-3.5 flex flex-col gap-2 select-none pointer-events-none opacity-60 group-hover:opacity-85 transition-opacity duration-300">
                                            {/* Mini browser/app header */}
                                            <div className="h-4 w-full rounded bg-white/[0.02] border border-white/[0.05] flex items-center px-2 justify-between">
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                                </div>
                                                <div className="w-8 h-1 rounded bg-white/[0.08]" />
                                            </div>
                                            
                                            {/* Mini body structure */}
                                            <div className="flex-1 flex gap-2 min-h-0">
                                                {/* Mini Sidebar */}
                                                <div className="w-7 h-full rounded bg-white/[0.01] border border-white/[0.04] flex flex-col gap-1.5 p-1">
                                                    <div className="h-1 w-full bg-white/[0.06] rounded" />
                                                    <div className="h-1 w-2/3 bg-white/[0.04] rounded" />
                                                    <div className="h-1 w-3/4 bg-white/[0.04] rounded" />
                                                </div>
                                                
                                                {/* Mini Canvas area */}
                                                <div className="flex-1 rounded bg-white/[0.005] border border-white/[0.03] relative overflow-hidden flex items-center justify-center">
                                                    {/* Canvas Grid Overlay */}
                                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:6px_6px]" />
                                                    
                                                    {/* Mini Canvas elements (Mock Design Frame) */}
                                                    <div className="relative w-14 h-9 rounded border border-white/[0.06] bg-neutral-900/80 flex items-center justify-center shadow-inner">
                                                        <div className="w-8 h-4 border border-white/[0.04] bg-white/[0.02] rounded-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Block */}
                                    <div className='space-y-0.5 px-0.5'>
                                        <h3 className='font-medium text-neutral-200 text-[13px] tracking-wide truncate group-hover:text-white transition-colors duration-200'>
                                            {project.name}
                                        </h3>

                                        {/* Safe Hydration-Proof Date Evaluator */}
                                        {(() => {
                                            const rawDate = project.lastModified || project.createdAt;
                                            const parsedDate = new Date(rawDate);

                                            if (!rawDate || isNaN(parsedDate.getTime())) {
                                                return <p className='text-[11px] font-normal text-neutral-500 animate-pulse'>Just now</p>;
                                            }

                                            return (
                                                <p
                                                    key={timeKey}
                                                    className='text-[11px] font-normal text-neutral-500 tracking-normal'
                                                    suppressHydrationWarning
                                                >
                                                    {formatDistanceToNow(parsedDate, { addSuffix: true })}
                                                </p>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default ProjectsList