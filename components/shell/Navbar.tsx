"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Settings, UserRound, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { useSession } from "@/context/SessionContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV" },
  { href: "/live", label: "Live TV" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { initialized, session, user, logout } = useSession();
  const isActiveLink = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="pointer-events-none fixed top-4 left-0 right-0 z-50 mx-auto w-full max-w-[1480px] px-4 transition-all md:px-6">
      <header className="pointer-events-auto relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.92),rgba(8,12,21,0.88))] shadow-[0_22px_48px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-[0.9rem] border border-white/10 bg-black/30 shadow-[0_10px_28px_rgba(0,0,0,0.3)]">
              <Image src="/64x64.png" alt="GrubX" fill sizes="40px" className="object-cover" priority />
            </div>
            <div>
              <p className="mb-1 text-[10px] leading-none tracking-[0.3em] text-[var(--muted)] uppercase">Streaming Shell</p>
              <p className="text-lg font-semibold leading-none tracking-tight text-white">GrubX</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  isActiveLink(link.href)
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-[var(--muted)] hover:bg-white/8 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/search"
              className="rounded-full border border-white/10 p-2.5 text-[var(--muted)] transition hover:border-white/20 hover:text-white"
              aria-label="Search"
            >
              <Search className="size-4" />
            </Link>

            {!initialized ? (
              <div className="h-10 w-32 animate-pulse rounded-full bg-white/10" />
            ) : session.status === "authenticated" && user ? (
              <>
                <div className="rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-white">
                  {user.username}
                </div>
                <Link
                  href="/settings"
                  className="rounded-full border border-white/10 p-2.5 text-[var(--muted)] transition hover:border-white/20 hover:text-white"
                  aria-label="Settings"
                >
                  <Settings className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-white">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-white/10 p-2.5 text-[var(--muted)] transition hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out lg:hidden",
            open ? "border-t border-white/10 max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex flex-col gap-2 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-white/10" />

            {!initialized ? null : session.status === "authenticated" && user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white">
                  <UserRound className="size-4 text-[var(--accent)]" />
                  <span>{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="rounded-xl bg-[var(--accent)] px-4 py-3 text-left text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
