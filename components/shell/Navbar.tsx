"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, Settings, UserRound, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { useSession } from "@/context/SessionContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "TV" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { initialized, session, user, logout } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-black/20 backdrop-blur-xl">
      <div className="page-shell">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <Image src="/64x64.png" alt="GrubX" fill sizes="48px" className="object-cover" priority />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Streaming Shell</p>
              <p className="text-2xl font-semibold tracking-tight">GrubX</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-[var(--muted)] transition hover:bg-white/6 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/search"
              className="rounded-full border border-white/10 p-3 text-[var(--muted)] transition hover:border-white/20 hover:text-white"
              aria-label="Search"
            >
              <Search className="size-4" />
            </Link>

            {!initialized ? (
              <div className="h-11 w-36 animate-pulse rounded-full bg-white/8" />
            ) : session.status === "authenticated" && user ? (
              <>
                <div className="liquid-glass-soft rounded-full px-4 py-2 text-sm">
                  {user.username}
                </div>
                <Link
                  href="/settings"
                  className="rounded-full border border-white/10 p-3 text-[var(--muted)] transition hover:border-white/20 hover:text-white"
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
                <Link href="/login" className="rounded-full px-4 py-2 text-sm text-[var(--muted)] transition hover:text-white">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-white/10 p-3 text-[var(--muted)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-white/8 transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="page-shell flex flex-col gap-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="liquid-glass-soft rounded-2xl px-4 py-3 text-sm"
            >
              {link.label}
            </Link>
          ))}

          {!initialized ? null : session.status === "authenticated" && user ? (
            <>
              <div className="liquid-glass-soft flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                <UserRound className="size-4 text-[var(--accent)]" />
                <span>{user.email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
                className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-left text-sm font-semibold text-black"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="liquid-glass-soft rounded-2xl px-4 py-3 text-sm">
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
