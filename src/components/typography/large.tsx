import React from "react";
import { cn } from "@/lib/utils";

export function TypographyLarge(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("text-lg font-semibold", props.className)}>
      {props.children}
    </div>
  );
}
