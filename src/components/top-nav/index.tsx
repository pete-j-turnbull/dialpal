"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const TopNav = (props: {
  left?: React.ReactNode | React.ReactNode[];
  right?: React.ReactNode | React.ReactNode[];
  style?: React.CSSProperties;
  className?: string;
}) => {
  const { style, className, left, right } = props;

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 flex h-[var(--top-nav-height)] justify-center transition-all duration-300",
        isScrolled && "shadow-[inset_0_-1px_0_0_rgba(60,60,60,0.1)]",
        className
      )}
      style={style}
    >
      <div className="w-full px-4">
        <div className="flex h-full items-center justify-between">
          <nav className="flex items-center justify-center gap-4">
            <Link href="/">
              <span className="tracking-tightest text-xl font-extrabold uppercase text-gray-900">
                Yuzu
              </span>
            </Link>

            {left}
          </nav>

          <nav className="flex items-center justify-center gap-4">{right}</nav>
        </div>
      </div>
    </nav>
  );
};
