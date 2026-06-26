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
                    <h1 className='text-2xl font-medium tracking-tight text-neutral-100'>Your Projects</h1>
                    <p className='text-sm text-neutral-400 mt-1 font-normal tracking-wide'>
                        Manage your design projects and continue where you left
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
                    {projects.map((project: any) => (
                        <Link
                            key={project._id}
                            href={`/dashboard/${user?.name}/canvas?project=${project._id}`}
                            className='group cursor-pointer scale-110 block no-underline'
                        >
                            <div className='space-y-3  transition-all duration-300 ease-out transform group-hover:-translate-y-1'>
                                {/* Image preview wrapper */}
                                <div className='aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/60 relative shadow-sm group-hover:shadow-md group-hover:border-neutral-700/80 transition-all duration-300 ease-out after:absolute after:inset-0 after:rounded-xl after:pointer-events-none after:border after:border-white/[0.04]'>
                                    {project.thumbnail ? (
                                        <Image
                                            src={project.thumbnail}
                                            alt={project.name || "Project thumbnail"}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                            className='object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out'
                                        />
                                    ) : (
                                        <div className='w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 flex items-center justify-center'>
                                            <div className='p-3 rounded-xl bg-neutral-800/40 border border-neutral-800/50 group-hover:scale-110 group-hover:bg-neutral-800/80 transition-all duration-300 ease-out'>
                                                <PlusIcon className='w-5 h-5 text-neutral-500 group-hover:text-neutral-300 transition-colors' />
                                            </div>
                                        </div>
                                    )}
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
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProjectsList