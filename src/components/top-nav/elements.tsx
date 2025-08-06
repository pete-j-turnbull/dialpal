"use client";

import { Button } from "../ui/button";

import Link from "next/link";

export const BackToHome = () => {
  return (
    <Button
      asChild
      size="sm"
      className="bg-accent hover:bg-accent text-accent-foreground font-medium shadow-none hover:brightness-95"
    >
      <Link href="/home">Back to home</Link>
    </Button>
  );
};

export const NavButton = (props: { icon: React.ReactNode; label: string }) => {
  const { icon, label } = props;

  return (
    <Button variant="ghost" className="gap-2 px-3">
      {icon}
      <span className="font-medium text-slate-800">{label}</span>
    </Button>
  );
};
