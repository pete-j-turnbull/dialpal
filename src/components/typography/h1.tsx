import React from "react";
import { cn } from "@/lib/utils";

export function TypographyH1(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <h1
      {...props}
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        props.className
      )}
    >
      {props.children}
    </h1>
  );
}
