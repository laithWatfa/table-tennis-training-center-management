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
      className={`flex gap-2 px-4 py-2 rounded transition-colors font-bold ${
        isActive
          ? "bg-primary fill-whiteT text-whiteT fo"
          : "text-textPrimary hover:text-primary"
      }`}
    >
    {icon}
      {label}
    </Link>
  );
}
