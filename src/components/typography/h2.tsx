import React from "react";
import { cn } from "@/lib/utils";

export function TypographyH2(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <h2
      {...props}
      className={cn("scroll-m-20 text-2xl font-bold", props.className)}
    >
      {props.children}
    </h2>
  );
}
