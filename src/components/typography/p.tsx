import React from "react";
import { cn } from "@/lib/utils";

export const TypographyP = (props: React.HTMLAttributes<HTMLElement>) => {
  return (
    <p {...props} className={cn(`leading-7`, props.className)}>
      {props.children}
    </p>
  );
};
