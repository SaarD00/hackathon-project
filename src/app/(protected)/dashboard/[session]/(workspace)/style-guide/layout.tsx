import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Hash, LayoutIcon, Type } from 'lucide-react'
import React from 'react'


type Props = {
    children: React.ReactNode
}


const tabs = [
    {
        value: 'colours',
        label: 'Colours',
        icon: Hash,
    },
    {
        value: 'typography',
        label: 'Typography',
        icon: Type,
    },
    {
        value: 'moodboard',
        label: 'Moodboard',
        icon: LayoutIcon,
    },
] as const
const layout = ({ children }: Props) => {
    return <Tabs className='w-full' defaultValue='colours'>
        <div className='mt-20 container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8'>
            <div>
                <div className='flex flex-col lg:flex-row gap-4 lg:gap-5 items-center justify-between'>
                    <div>
                        <h1 className='text-3xl  lg:text-left text-center font-light text-foreground'>
                            Style Guide
                        </h1>
                        <p className='text-muted-foreground font-light mt-2 text-center text-sm lg:text-left'>
                            Manage your style guide for your project
                        </p>
                    </div>
                    <TabsList className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#141416] border border-zinc-800/80 py-6 px-2 shadow-lg">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center justify-center gap-2.5 rounded-full px-4 py-4 text-sm font-medium text-zinc-500 transition-all duration-300 select-none    data-[state=active]:text-zinc-50  hover:text-zinc-200"
                                >
                                    <Icon className="w-4 h-4  stroke-[1.7]" />
                                    <span className="hidden  sm:inline font-light tracking-tight">{tab.label}</span>
                                    <span className="sm:hidden tracking-wide">{tab.value}</span>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </div>
            </div>
        </div>
        <hr className=''></hr>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 sm:py-4'>
            {children}
        </div>

    </Tabs>
}

export default layout
