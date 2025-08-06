import { cn } from "@/lib/utils";
import React from "react";

export function TypographySmall(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <small
      {...props}
      className={cn("text-sm font-medium leading-none", props.className)}
    >
      {props.children}
    </small>
  );
}
