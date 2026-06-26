"use client"

import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function LoginPage() {
    const { isLoading, handleSignIn, signInForm } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = signInForm
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black text-[#EDEDED] p-6 md:p-10 relative overflow-hidden">
            {/* Premium minimal background noise/grid - very subtle */}
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_100%)]" />

            <div className="flex w-full max-w-md flex-col gap-8 relative z-10">
                <Link href="/" className="flex items-center gap-3 self-center font-medium transition-transform hover:scale-[1.02] active:scale-95">
                    {/* Minimal Logo */}
                    <div className="relative w-10 h-10 flex items-center justify-center bg-transparent border border-white/10 rounded-md">
                        <svg className="w-[20px] h-[20px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12c0 0 4-7 8-7s8 7 8 7-4 7-8 7-8-7-8-7z" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
                            <path d="M6 18L18 6" />
                            <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
                        </svg>
                    </div>
                    <span className="text-2xl font-medium tracking-tight text-white">Samsaar</span>
                </Link>
                <LoginForm handleSubmit={handleSubmit} handleSignIn={handleSignIn} register={register} errors={errors} isLoading={isLoading} />
            </div>
        </div>
    )
}
