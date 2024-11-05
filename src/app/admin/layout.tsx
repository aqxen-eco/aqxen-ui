"use client";

import { Link } from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { MdKeyboardArrowLeft } from "react-icons/md";

const navLinks = [
  {
    label: "Organization",
    href: "/admin/organization",
  },
  {
    label: "Subscription",
    href: "/admin/subscription",
  },
  {
    label: "Badges",
    href: "/admin/badges",
  },
  {
    label: "Seasons",
    href: "/admin/seasons",
  },
  {
    label: "Badges automation",
    href: "/admin/badges-automation",
  },
];

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isFirstPage = navLinks.some((link) => link.href === pathname);
  const backNavLink = navLinks.find((link) => pathname.includes(link.href));

  return (
    <>
      <nav className="mx-auto max-w-container-lg desktop:px-4 desktop:pt-4 mobile:pt-2">
        <div className="pb-2 border-b border-gray-2 overflow-x-auto">
          <ul className="flex gap-2">
            {isFirstPage ? (
              navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    variant={pathname === link.href ? "link" : "default"}
                  >
                    {link.label}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link href={backNavLink!.href} variant="default">
                  <MdKeyboardArrowLeft className="size-6" />
                  {backNavLink!.label}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
      {children}
    </>
  );
}
