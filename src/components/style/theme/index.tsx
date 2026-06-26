import { cn } from "@/lib/utils";
import { ColorSwatch } from "../swatch";

type Props = {
    title: string,
    swatches: Array<{
        name: string,
        hexColor: string,
        description: string,

    }>
    className?: string,

}

export const ColorTheme = ({ title, swatches, className }: Props) => {
    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <h3 className="text-xs font-medium tracking-widest uppercase text-white/40">{title}</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                {swatches.map((swatch) => (
                    <div key={swatch.name} className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] border border-white/10 flex-shrink-0 group-hover:scale-110 transition-transform duration-500 ease-out"
                                style={{ backgroundColor: swatch.hexColor }}
                            />
                            <div className="flex flex-col min-w-0">
                                <h4 className="text-sm font-medium text-white/90 truncate">{swatch.name}</h4>
                                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{swatch.hexColor}</p>
                            </div>
                        </div>
                        {swatch.description && (
                            <p className="text-xs text-white/50 leading-relaxed">
                                {swatch.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ThemeContent = ({ colorGuide }: { colorGuide: any }) => {
    return (
        <div className="flex flex-col gap-8 px-2 pb-4">
            {Object.values(colorGuide).map((section: any, index: number) => (
                <ColorTheme
                    key={index}
                    title={section.title}
                    swatches={section.swatches}
                />
            ))}
        </div>
    );
};