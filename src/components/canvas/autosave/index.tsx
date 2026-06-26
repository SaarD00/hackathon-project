"use client"


import { useAutosaveProjectMutation } from '@/redux/api/project'
import { useAppSelector } from '@/redux/store'
import { AlertCircle, CheckCircle, Cloud, CloudAlert, CloudCheck, CloudRain, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const AutoSave = () => {
    const [saveStatus, setSaveStatus] = useState<
        'idle' | 'saving' | 'saved' | 'error'
    >('idle')

    const searchParams = useSearchParams()

    const projectId = searchParams.get('project')
    const user = useAppSelector((state) => state.profile)
    const shapesState = useAppSelector((state) => state.shapes)

    const [autosaveProject, { isLoading: isSaving }] = useAutosaveProjectMutation()
    const viewportState = useAppSelector((state) => state.viewport)

    const abortRef = useRef<AbortController | null>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastSavedRef = useRef<string>('')

    const isReady = Boolean(projectId && user?.id)
    const booleanIsReady = useRef

    useEffect(() => {
        if (!isReady) return
        const stateString = JSON.stringify({
            shapes: shapesState,
            viewport: viewportState,
        })

        if (stateString === lastSavedRef.current) return

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(async () => {
            lastSavedRef.current = stateString
            if (abortRef.current) abortRef.current.abort()
            abortRef.current = new AbortController()
            setSaveStatus('saving')

            try {
                await autosaveProject({
                    // @ts-ignore
                    projectId: projectId as String,
                    userId: user?.id as String,
                    shapesData: shapesState,
                    viewportData: {
                        scale: viewportState.scale,
                        translate: viewportState.translate,
                    }
                }).unwrap()
                setSaveStatus("saved")
                setTimeout(() => setSaveStatus("idle"), 2000)

            } catch (err) {
                if ((err as Error).name === "AbortError") return
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)

            }
        }, 1000)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [isReady, shapesState, viewportState, projectId, user?.id, autosaveProject])


    useEffect(() => {
        if (abortRef.current) abortRef.current.abort()
        if (debounceRef.current) clearTimeout(debounceRef.current)
    }, [])

    if (!isReady) {
        return null
    }


    if (isSaving) {
        return (
            <div className='flex items-center'>
                <Loader2 className='w-4 h-4 animate-spin' />
            </div>
        )
    }






    switch (saveStatus) {
        case 'saved':
            return (
                <div className="flex items-center">
                    <CloudCheck className="" />
                </div>
            )
        case 'error':
            return (
                <div className="flex items-center">
                    <CloudAlert className="w-4 h-4" />
                </div>
            )
        default:
            return <div className='flex items-center'><CloudRain className='' /></div>
    }
}
export default AutoSave
