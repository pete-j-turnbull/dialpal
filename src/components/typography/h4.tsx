import React from "react";
import { cn } from "@/lib/utils";

export const TypographyH4 = (props: React.HTMLAttributes<HTMLElement>) => {
  return (
    <h4
      {...props}
      className={cn(`scroll-m-20 text-xl font-black`, props.className)}
    >
      {props.children}
    </h4>
  );
};
