import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-8 w-full rounded-[6px] border border-line bg-surface px-2.5 text-[13px] text-ink outline-none placeholder:text-faint focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
