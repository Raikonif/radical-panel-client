import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/55 bg-white/44 px-3.5 py-2 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_40px_-28px_rgba(76,29,149,0.22)] backdrop-blur-xl transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:bg-white/62 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/14 dark:bg-white/8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_-28px_rgba(0,0,0,0.5)] dark:focus-visible:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
