import * as React from "react";
import { cn } from "@/lib/utils";

export type ShimmerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-14 items-center justify-center rounded-xl border border-[#00913f]/50 bg-[linear-gradient(110deg,#00b050,45%,#22c55e,55%,#00b050)] bg-[length:200%_100%] px-8 font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#00b050] focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          className
        )}
        style={{
          animation: "shimmer 2s linear infinite",
        }}
        {...props}
      >
        {children}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            from { background-position: 200% 0; }
            to { background-position: -200% 0; }
          }
        `}} />
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
