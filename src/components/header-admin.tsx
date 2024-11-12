import { Link } from "@/components/ui/link";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { MdOutlineInfo } from "react-icons/md";
import type { LinkProps } from "next/link";
import { twMerge } from "tailwind-merge";

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
] as const;

type HeaderAdminProps = {
  children?: React.ReactNode
};

export function HeaderAdmin({ children }: HeaderAdminProps) {
  return (
    <div className="desktop:pt-4 mobile:pt-2">
      {children}
    </div>
  );
}

type HeaderAdminMenuProps = {
  activeHref?: typeof navLinks[number]['href']
};

export function HeaderAdminMenu({ activeHref }: HeaderAdminMenuProps) {
  return (
    <div className="max-w-container-lg desktop:px-4 mx-auto">
      <nav className="pb-2 border-b border-gray-2 overflow-x-auto">
        <ul className="flex gap-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                variant={activeHref === link.href ? "link" : "default"}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

type HeaderAdminBackProps = {
  children: React.ReactNode
} & LinkProps;

export function HeaderAdminBack({ children, ...props}: HeaderAdminBackProps) {
  return (
    <div className="max-w-container-lg desktop:px-4 mx-auto">
      <nav className="pb-2 border-b border-gray-2 overflow-x-auto">
        <Link {...props} variant="default">
          <MdKeyboardArrowLeft className="size-6" />
          {children}
        </Link>
      </nav>
    </div>
  )
}

type HeaderAdminTitleProps = {
  title: string | React.ReactNode
  tooltip?: string
  className?: string
  children?: React.ReactNode
}

export function HeaderAdminTitle({ title, tooltip, className, children }: HeaderAdminTitleProps) {
  return (
    <div className={twMerge("max-w-container-lg px-4 mx-auto py-8", className)}>
      <header className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-1">
          <h1 className="text-title-1 text-white">{title}</h1>
          {tooltip && (
            <Tooltip content={tooltip}>
              <Button variant="link" size="md" square>
                <MdOutlineInfo className="size-6" />
              </Button>
            </Tooltip>
          )}
        </div>
        {children && (
          <div className="flex-none">
            {children}
          </div>
        )}
      </header>
    </div>
  )
}