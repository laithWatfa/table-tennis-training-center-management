// components/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JSX } from "react";

interface NavLinkProps {
  href: string;
  label: string;
  icon : JSX.Element;
}

export default function NavLink({ href, label,icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex gap-2 px-4 py-2 rounded-full transition-colors font-bold ${
        isActive
          ? "bg-surface shadow-innerBtn fill-primary text-primary fo"
          : "bg-primary text-whiteT fill-whiteT hover:shadow-primary shadow-basic"
      }`}
    >
    {icon}
      {label}
    </Link>
  );
}
