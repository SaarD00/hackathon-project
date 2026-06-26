import Link from "next/link";
import { ArrowRight, Layers, Code2, MousePointer, Bot, Download, LayoutGrid } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-[#EDEDED] font-sans selection:bg-white/20 overflow-x-hidden relative flex flex-col">
      {/* Premium minimal background noise/grid - very subtle */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_100%)]" />

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            {/* Minimal Logo */}
            <div className="relative w-8 h-8 flex items-center justify-center bg-transparent border border-white/10 rounded-md">
              <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12c0 0 4-7 8-7s8 7 8 7-4 7-8 7-8-7-8-7z" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
                <path d="M6 18L18 6" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <span className="text-lg font-medium tracking-tight text-white">
              Samsaar
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-40 pb-24 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-xs font-medium mb-4">
            <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Samsaar is now available
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] pb-2">
            The infinite canvas <br className="hidden md:block" />
            <span className="text-neutral-500">for product teams.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
            Design visually, generate production-ready code instantly.
            Samsaar bridges the gap between layout and code with zero friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <Link
              href="/auth/sign-up"
              className="group flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 text-black px-8 py-3.5 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
            >
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
            >
              View Documentation
            </Link>
          </div>
        </div>

        {/* Minimal Premium SaaS Pure-CSS Workspace Mockup */}
        <div className="w-full max-w-6xl mx-auto mt-24 p-[1px] rounded-xl bg-gradient-to-b from-white/10 to-transparent relative overflow-hidden">
          <div className="rounded-xl bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">

            {/* Mock Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#050505]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="text-xs text-neutral-500 ml-4 font-mono">dashboard_layout.tsx</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-mono font-medium">Ready</span>
              </div>
            </div>

            <div className="grid grid-cols-12 flex-1">
              {/* Left Toolbar */}
              <div className="col-span-1 border-r border-white/5 bg-[#050505] flex flex-col items-center py-6 gap-6">
                <div className="p-2 rounded-md bg-white text-black shadow-sm">
                  <MousePointer className="h-4 w-4" />
                </div>
                <div className="p-2 rounded-md text-neutral-500 hover:text-white transition-colors cursor-pointer">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div className="p-2 rounded-md text-neutral-500 hover:text-white transition-colors cursor-pointer">
                  <Layers className="h-4 w-4" />
                </div>
              </div>

              {/* Canvas Area (Grid) */}
              <div className="col-span-8 bg-[#0a0a0a] relative p-10 flex items-center justify-center overflow-hidden"
                style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "20px 20px" }}>

                {/* Minimal Layout Card Mockup */}
                <div className="relative border border-white/10 p-8 rounded-lg bg-[#111111] max-w-sm w-full shadow-2xl">

                  {/* Drag handles */}
                  <span className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#111] rounded-sm shadow-sm" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#111] rounded-sm shadow-sm" />
                  <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#111] rounded-sm shadow-sm" />
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#111] rounded-sm shadow-sm" />

                  {/* Card Tag */}
                  <div className="absolute -top-7 left-0 text-[10px] font-mono text-neutral-400">
                    Card [400x320]
                  </div>

                  {/* Component content */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Total Revenue</p>
                      <h4 className="text-3xl font-medium text-white tracking-tight mt-1">$128,430.00</h4>
                    </div>

                    <div className="h-24 w-full flex items-end gap-2 pt-2">
                      <span className="w-full h-8 bg-neutral-800 rounded-sm hover:bg-neutral-700 transition-colors" />
                      <span className="w-full h-12 bg-neutral-800 rounded-sm hover:bg-neutral-700 transition-colors" />
                      <span className="w-full h-16 bg-white border border-neutral-700 rounded-sm shadow-sm" />
                      <span className="w-full h-14 bg-neutral-800 rounded-sm hover:bg-neutral-700 transition-colors" />
                      <span className="w-full h-9 bg-neutral-800 rounded-sm hover:bg-neutral-700 transition-colors" />
                    </div>

                    <div className="flex justify-between text-[10px] text-neutral-600 font-mono">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                    </div>
                  </div>
                </div>

                {/* Decorative floating cursor */}
                <div className="absolute bottom-16 right-24 flex items-center gap-2 pointer-events-none select-none bg-black border border-white/10 px-3 py-1.5 rounded-full shadow-2xl">
                  <MousePointer className="h-3 w-3 text-white rotate-90 fill-white drop-shadow-md" />
                  <span className="text-[10px] font-medium text-neutral-300">Designer</span>
                </div>
              </div>

              {/* Side Compile Inspector */}
              <div className="col-span-3 border-l border-white/5 bg-[#050505] flex flex-col p-5">
                <div className="text-xs font-medium text-white pb-4 border-b border-white/5 mb-5 flex items-center justify-between">
                  <span>Code Output</span>
                  <Code2 className="h-3.5 w-3.5 text-neutral-500" />
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-neutral-500">PROMPT</span>
                    <div className="bg-[#111] border border-white/5 rounded-md p-3 text-xs text-neutral-400 font-mono leading-relaxed">
                      "Generate a high-contrast minimalist revenue chart component."
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-mono text-neutral-500 mb-3">REACT / TAILWIND</span>
                    <div className="flex-1 bg-[#111] border border-white/5 rounded-md p-4 font-mono text-[10px] text-neutral-400 overflow-y-auto space-y-2 select-all">
                      <div><span className="text-neutral-500">export function</span> <span className="text-white">Chart</span>() {`{`}</div>
                      <div className="pl-2"><span className="text-neutral-500">return</span> (</div>
                      <div className="pl-4">{`<div className="border`}</div>
                      <div className="pl-4">{`border-white/10 p-8`}</div>
                      <div className="pl-4">{`rounded-lg bg-[#111]">`}</div>
                      <div className="pl-6 pt-2">{`<div className="w-full`}</div>
                      <div className="pl-6">{`h-16 bg-white rounded">`}</div>
                      <div className="pl-6">{`</div>`}</div>
                      <div className="pl-4 pt-2">{`</div>`}</div>
                      <div className="pl-2">)</div>
                      <div>{`}`}</div>
                    </div>
                  </div>

                  <button className="w-full bg-white hover:bg-neutral-200 text-black rounded-md py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Feature Sections */}
        <div className="max-w-5xl mx-auto mt-40 space-y-24 w-full">

          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">Built for speed and precision</h2>
            <p className="text-base text-neutral-400 leading-relaxed font-light">
              We eliminated the traditional design handoff. Layout your ideas, refine them with context, and export production-ready code directly to your codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Step 1 */}
            <div className="flex flex-col gap-5 border border-white/5 bg-[#050505] p-8 rounded-xl hover:bg-[#0a0a0a] hover:border-white/10 transition-colors">
              <div className="h-10 w-10 rounded-md bg-[#111] border border-white/5 flex items-center justify-center">
                <LayoutGrid className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mt-2">Unconstrained Canvas</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">
                Start with a blank sheet. Drag shapes, draw boxes, and align layouts inside an infinite, high-performance canvas environment.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-5 border border-white/5 bg-[#050505] p-8 rounded-xl hover:bg-[#0a0a0a] hover:border-white/10 transition-colors">
              <div className="h-10 w-10 rounded-md bg-[#111] border border-white/5 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mt-2">Intelligent Generation</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">
                Provide instructions or let the engine automatically parse visual structures to write high-fidelity layouts styled perfectly with Tailwind.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-5 border border-white/5 bg-[#050505] p-8 rounded-xl hover:bg-[#0a0a0a] hover:border-white/10 transition-colors">
              <div className="h-10 w-10 rounded-md bg-[#111] border border-white/5 flex items-center justify-center">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mt-2">Zero Lock-in</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">
                Export directly to clean React or HTML bundles. Click "Export" inside the workspace and carry your compiled UI directly to your repository.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-auto z-10 relative bg-black">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12c0 0 4-7 8-7s8 7 8 7-4 7-8 7-8-7-8-7z" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
              <path d="M6 18L18 6" />
              <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-sm text-neutral-500">Samsaar © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-neutral-500">
            <Link href="/auth/sign-in" className="hover:text-white transition-colors">Workspace</Link>
            <Link href="/auth/sign-up" className="hover:text-white transition-colors">Sign up</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
