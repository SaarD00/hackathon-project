"use client"

import { Button } from '@/components/ui/button'
import { useProjectCreation } from '@/hooks/use-project'
import { Loader2, PlusIcon } from 'lucide-react'
import React from 'react'
//  make a good button

const CreateProject = () => {
    const { createProject, isCreating, canCreate } = useProjectCreation()
    return (
        //  copilot make a button, bruh why u no create button, very sad ;(
        <Button variant={"default"} onClick={() => createProject()} disabled={canCreate || isCreating} className='flex items-center text-sm py-5 gap-2 cursor-pointer rounded-full' >
            {isCreating ? (
                <Loader2 className='w-4 h-4 animate-spin'>

                </Loader2>
            ) : (
                <PlusIcon className='h-4 w-4' />
            )}
            {isCreating ? "creating..." : "New Project"}

        </Button>
    )
}

export default CreateProject
