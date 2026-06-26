"use client"

import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/redux/store'
import { GeneratedUIShape } from '@/redux/slice/shapes'
import JSZip from 'jszip'
import { Download, Loader2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface PageMeta {
    title: string
    filename: string
    html: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractPageTitle(html: string, fallback: string): string {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    if (h1Match) {
        return h1Match[1].replace(/<[^>]*>/g, '').trim().slice(0, 50) || fallback
    }
    return fallback
}

/**
 * Fuzzy-match a nav link's visible text to the best-fitting page.
 * Returns null if no reasonable match is found.
 */
function findBestPageMatch(linkText: string, pages: PageMeta[]): PageMeta | null {
    const normalized = linkText.toLowerCase().trim()
    if (!normalized || normalized.length < 2) return null

    // 1. Exact match
    for (const p of pages) {
        if (p.title.toLowerCase() === normalized) return p
    }

    // 2. Substring match (either direction)
    for (const p of pages) {
        const t = p.title.toLowerCase()
        if (t.includes(normalized) || normalized.includes(t)) return p
    }

    // 3. Word-overlap scoring
    const linkWords = normalized.split(/[\s\-_&]+/).filter(w => w.length > 2)
    let best: PageMeta | null = null
    let bestScore = 0

    for (const p of pages) {
        const titleWords = p.title.toLowerCase().split(/[\s\-_&]+/).filter(w => w.length > 2)
        let hits = 0
        for (const lw of linkWords) {
            if (titleWords.some(tw => tw.includes(lw) || lw.includes(tw))) hits++
        }
        const score = hits / Math.max(linkWords.length, titleWords.length, 1)
        if (score > bestScore && score >= 0.3) {
            bestScore = score
            best = p
        }
    }

    return best
}

/**
 * Inject real page hrefs into the HTML's existing <nav> elements.
 * If no <nav> is found, prepends a minimal sticky nav bar.
 */
function injectNavigation(html: string, pages: PageMeta[], currentPage: PageMeta): string {
    const navRegex = /(<nav\b[^>]*>)([\s\S]*?)(<\/nav>)/gi
    const hasNav = navRegex.test(html)
    navRegex.lastIndex = 0 // reset after .test()

    if (!hasNav) {
        // No existing nav — prepend a simple one
        const navHtml = buildFallbackNav(pages, currentPage)
        // Insert right after the first opening tag (usually <div data-generated-ui>)
        const firstClose = html.indexOf('>')
        if (firstClose !== -1) {
            return html.slice(0, firstClose + 1) + '\n' + navHtml + html.slice(firstClose + 1)
        }
        return navHtml + html
    }

    // Process each <nav> — update <a> hrefs within it
    return html.replace(navRegex, (_match, openTag: string, content: string, closeTag: string) => {
        const usedFilenames = new Set<string>()
        const linkRegex = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi

        // Pass 1 — update hrefs of existing links
        let modifiedContent = content.replace(
            linkRegex,
            (_lm: string, attrs: string, linkContent: string) => {
                const plainText = linkContent.replace(/<[^>]*>/g, '').trim()
                const available = pages.filter(p => !usedFilenames.has(p.filename))
                const matched = findBestPageMatch(plainText, available)

                if (matched) {
                    usedFilenames.add(matched.filename)
                    let newAttrs = attrs
                    if (/href\s*=\s*["'][^"']*["']/i.test(attrs)) {
                        newAttrs = attrs.replace(/href\s*=\s*["'][^"']*["']/i, `href="${matched.filename}"`)
                    } else {
                        newAttrs = `href="${matched.filename}" ${attrs}`
                    }
                    return `<a ${newAttrs}>${linkContent}</a>`
                }
                return `<a ${attrs}>${linkContent}</a>`
            }
        )

        // Pass 2 — append links for any pages not yet wired up
        const unlinked = pages.filter(p => !usedFilenames.has(p.filename))
        if (unlinked.length > 0) {
            const extras = unlinked.map(p =>
                `<a href="${p.filename}" style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;border-radius:9999px;transition:all 0.2s ease;">${p.title}</a>`
            ).join('\n            ')

            // Insert after the last </a> so ordering stays natural
            const lastAnchorEnd = modifiedContent.lastIndexOf('</a>')
            if (lastAnchorEnd !== -1) {
                const pos = lastAnchorEnd + 4
                modifiedContent = modifiedContent.slice(0, pos) + '\n            ' + extras + modifiedContent.slice(pos)
            } else {
                modifiedContent += '\n            ' + extras
            }
        }

        return openTag + modifiedContent + closeTag
    })
}

/** Minimal sticky nav for pages that don't have their own <nav> */
function buildFallbackNav(pages: PageMeta[], currentPage: PageMeta): string {
    const links = pages.map(p => {
        const isActive = p.filename === currentPage.filename
        return `    <a href="${p.filename}" style="color:${isActive ? '#fff' : 'rgba(255,255,255,0.6)'};text-decoration:none;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;border-radius:9999px;${isActive ? 'background:rgba(255,255,255,0.1);' : ''}transition:all 0.2s ease;">${p.title}</a>`
    }).join('\n')

    return `<nav style="position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:0.5rem;padding:1rem 2rem;background:rgba(10,10,10,0.85);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.08);">
${links}
</nav>`
}

/** Wrap body HTML in a full HTML document with Tailwind CDN + Google Fonts */
function buildPageHtml(title: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body>
    ${body}
</body>
</html>`
}

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bot } from 'lucide-react'

// ─── Component ──────────────────────────────────────────────────────────────

const ExportProject = () => {
    const [isExporting, setIsExporting] = useState(false)
    const [exportType, setExportType] = useState<'none' | 'standard' | 'ai'>('none')
    const shapesState = useAppSelector((state) => state.shapes)

    const generatedUIs = useMemo(() => {
        const allShapes = Object.values(shapesState.shapes.entities) as GeneratedUIShape[]
        return allShapes.filter(
            (s) => s?.type === 'generatedui' && s.uiSpecData
        )
    }, [shapesState.shapes.entities])

    const canExport = generatedUIs.length >= 2

    const handleExport = async () => {
        if (!canExport || isExporting) return
        setIsExporting(true)
        setExportType('standard')

        try {
            const zip = new JSZip()

            // ── 1. Build page map ──────────────────────────────────────────
            // First generated page → index.html (the landing page)
            // Remaining pages → page-2.html, page-3.html, …
            const pages: PageMeta[] = generatedUIs.map((ui, i) => {
                const title = extractPageTitle(ui.uiSpecData!, `Page ${i + 1}`)
                const filename = i === 0 ? 'index.html' : `page-${i + 1}.html`
                return { title, filename, html: ui.uiSpecData! }
            })

            // ── 2. Inject navigation & write files ─────────────────────────
            pages.forEach((page) => {
                const linkedHtml = injectNavigation(page.html, pages, page)
                const fullHtml = buildPageHtml(page.title, linkedHtml)
                zip.file(page.filename, fullHtml)
            })

            // ── 3. Download ZIP ────────────────────────────────────────────
            const blob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'exported-app.zip'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
        } finally {
            setIsExporting(false)
            setExportType('none')
        }
    }

    const handleExportAI = async () => {
        if (!canExport || isExporting) return
        setIsExporting(true)
        setExportType('ai')

        try {
            const urlParams = new URLSearchParams(window.location.search)
            const projectId = urlParams.get("project")

            if (!projectId) {
                console.error("No project ID found in URL")
                return
            }

            const pages: PageMeta[] = generatedUIs.map((ui, i) => {
                const title = extractPageTitle(ui.uiSpecData!, `Page ${i + 1}`)
                const filename = i === 0 ? 'index.html' : `page-${i + 1}.html`
                return { title, filename, html: ui.uiSpecData! }
            })

            const res = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, pages })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || "Failed to export with AI")
            }

            const data = await res.json()
            const updatedPages = data.pages as PageMeta[]

            const zip = new JSZip()
            updatedPages.forEach((page) => {
                // Find original title if missing
                const originalPage = pages.find(p => p.filename === page.filename)
                const title = originalPage?.title || page.filename
                
                const fullHtml = buildPageHtml(title, page.html)
                zip.file(page.filename, fullHtml)
            })

            const blob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'ai-exported-app.zip'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

        } catch (err) {
            console.error('Export AI failed:', err)
        } finally {
            setIsExporting(false)
            setExportType('none')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    disabled={!canExport || isExporting}
                    className="flex items-center bg-[#18181b]/95 text-white border border-white/20 text-sm py-5 gap-2 cursor-pointer rounded-full"
                    title={canExport ? 'Export as web app' : 'Need at least 2 generated pages to export'}
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {isExporting 
                        ? (exportType === 'ai' ? 'Exporting with AI...' : 'Exporting...') 
                        : 'Export'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#18181b]/95 border border-white/20 text-white shadow-xl backdrop-blur-xl rounded-xl p-2 z-[100]">
                <DropdownMenuItem 
                    onClick={handleExport} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors"
                >
                    <Download className="w-4 h-4 text-white/70" />
                    <span className="text-sm font-medium">Standard Export (ZIP)</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={handleExportAI} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors mt-1"
                >
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Export with AI (Routing)</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ExportProject

