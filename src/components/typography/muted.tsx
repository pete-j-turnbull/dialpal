import React from "react";
import { cn } from "@/lib/utils";

export const TypographyMuted = (props: React.HTMLAttributes<HTMLElement>) => {
  return (
    <p
      {...props}
      className={cn(`text-sm text-muted-foreground`, props.className)}
    >
      {props.children}
    </p>
  );
};
