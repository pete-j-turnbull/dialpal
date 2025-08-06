import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type LayoutProps = Readonly<{
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}>;

export default async function Layout({ params, children }: LayoutProps) {
  const { orgSlug } = await auth();
  const { slug } = await params;

  if (slug != orgSlug && slug != "personal") {
    return redirect(`/orgs/${orgSlug}`);
  }

  return <>{children}</>;
}
