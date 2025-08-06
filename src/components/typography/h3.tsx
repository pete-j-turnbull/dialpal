import React from "react";
import { cn } from "@/lib/utils";

export function TypographyH3(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <h3
      {...props}
      className={cn("scroll-m-20 text-2xl font-semibold", props.className)}
    >
      {props.children}
    </h3>
  );
}
