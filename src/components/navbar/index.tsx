"use client"
import { useQuery } from 'convex/react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
//  react fragment for navbar component
import React from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { api } from '../../../convex/_generated/api'
import { CircleQuestionMark, Hash, LayoutTemplate, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useAppSelector } from '@/redux/store'
import CreateProject from '../buttons/project'
import ExportProject from '../buttons/export'
import AutoSave from '../canvas/autosave'

type TabProps = {
    label: string,
    href: string,
    icon?: React.ReactNode,
}


const Navbar = () => {
    const params = useSearchParams()
    const projectId = params.get('project')
    const pathName = usePathname()

    const me = useAppSelector((state) => state.profile)
    const tabs: TabProps[] = [
        {
            label: "Canvas",
            href: `/dashboard/${me.name}/canvas?project=${projectId}`,
            icon: <Hash className='h-4 w-4' />
        },
        {
            label: "Style Guide",
            href: `/dashboard/${me.name}/style-guide?project=${projectId}`,
            icon: <LayoutTemplate className='h-4 w-4' />
        }
    ]
    const hasCanvas = pathName.includes("canvas")
    const hasStyleGuide = pathName.includes("style-guide")

    const project = useQuery(
        api.projects.getProject,
        projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
    )
    return (
        <div className='grid grid-cols-2 lg:grid-cols-2 p-6 fixed top-0 left-0 right-0 z-50'>
            <div className='flex items-center gap-4'>
                <Link href={`/dashboard/${me.name}`} className='w-8 h-8 rounded-full border-3 border-white bg-black flex items-center  justify-center' >
                    <div className='w-4 h-4 rounded-full bg-white'>
                    </div>
                </Link>
                {(!hasCanvas || !hasStyleGuide) && (
                    <div>
                        {project?.name && (
                            <div className="lg:inline-block hidden rounded-full text-primary/60 border border-white/[0.12] backdrop-blur-xl bg-[#18181a] px-4 py-2 text-sm saturate-150">
                                {project?.name}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* {hasCanvas && (

                <div className="lg:flex hidden items-center justify-center gap-2">
                    <div className="flex items-center gap-2 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-full p-2 saturate-150">
                        {tabs.map((t) => (
                            <Link
                                key={t.href}
                                href={t.href}
                                className={[
                                    'group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs transition',
                                    `${pathName}?project=${projectId}` === t.href
                                        ? 'bg-white/[0.12] text-xs text-white border border-white/[0.16] backdrop-blur-sm'
                                        : 'text-zinc-400 text-xs hover:text-zinc-200 hover:bg-white/[0.06] border border-transparent',
                                ].join(' ')}
                            >
                                <span
                                    className={
                                        `${pathName}?project=${projectId}` === t.href
                                            ? 'opacity-100'
                                            : 'opacity-70 group-hover:opacity-90'
                                    }
                                >
                                    {t.icon}
                                </span>
                                <span>{t.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )} */}
            <div className='flex items-center gap-4 justify-end'>

                {hasCanvas && <div className='p-2 rounded-full border bg-[#18181b]/95 h-10 w-10 flex justify-center'>  <AutoSave /></div>}
                {hasCanvas ? <ExportProject /> : <CreateProject />}
                <Avatar className='size-9 ml-2'>
                    <AvatarImage src={me.image || ""} />
                    <AvatarFallback>
                        <User className="size-4 text-black" />
                    </AvatarFallback>
                </Avatar>

            </div>
        </div>
    )
}

export default Navbar