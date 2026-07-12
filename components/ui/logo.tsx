import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon */}
      <div className="relative flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 overflow-hidden">
        {/* Dynamic Hexagon Grid Lines */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)", backgroundSize: "10px 10px", backgroundPosition: "0 0, 5px 5px" }} />
        
        {/* Core Vector Logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 w-6 h-6 text-white"
        >
          {/* Central hexagon */}
          <path d="M12 2L2 7l10 5 10-5-10-5Z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
          <path d="M12 12v10" />
        </svg>
      </div>

      {/* Typography */}
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-foreground leading-none">
            Transit<span className="text-primary">Ops</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
            Supply Link
          </span>
        </div>
      )}
    </div>
  );
}
