"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const links = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Writing", href: "/writing" },
  { label: "Travel", href: "/travel" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="new-header">
    <div className="new-header-inner">
      <Link className="new-brand" href="/" onClick={() => setOpen(false)}>Mirza Mahad Baig<span className="brand-mark" aria-hidden="true" /></Link>
      <nav aria-label="Main navigation" className={open ? "new-nav is-open" : "new-nav"}>
        {links.map(({label, href}) => <Link onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} href={href} key={href}>{label}</Link>)}
        <Link className="new-chat" href="/chat" onClick={() => setOpen(false)}>Talk to Mahad <ArrowUpRight size={16}/></Link>
      </nav>
      <button className="new-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>
  </header>;
}
