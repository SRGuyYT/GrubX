"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/context/SessionContext";

export default function RegisterPage() {
  const router = useRouter();
  const { session, register, loginWithGithub } = useSession();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session.status === "authenticated") {
      router.replace("/settings");
    }
  }, [router, session.status]);

  const isBusy = session.status === "authenticating";

  return (
    <div className="page-shell py-12">
      <div className="grid gap-6 lg:grid-cols-[1fr,0.95fr]">
        <section className="liquid-glass rounded-[2rem] px-6 py-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Create account</p>
          <h1 className="mt-3 text-4xl font-semibold">Provision your GrubX profile</h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Registration creates a Firebase identity. From there you can switch between account and guest mode
            without merging data.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void register(email, username, password)
                .then(() => {
                  toast.success("Account created.");
                  router.push("/settings");
                })
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Registration failed."));
            }}
          >
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="liquid-glass-soft w-full rounded-full px-5 py-4 text-sm outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="liquid-glass-soft w-full rounded-full px-5 py-4 text-sm outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              className="liquid-glass-soft w-full rounded-full px-5 py-4 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="w-full rounded-full bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Create Firebase account
              </span>
            </button>
          </form>

          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void loginWithGithub()
                .then(() => {
                  toast.success("Signed in with GitHub.");
                  router.push("/settings");
                })
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "GitHub sign-in failed."))
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-4 text-sm text-white transition hover:border-white/20 disabled:opacity-60"
          >
            <Github className="size-4" />
            Continue with GitHub
          </button>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-white underline decoration-white/20 underline-offset-4">
              Log in
            </Link>
          </p>
        </section>

        <section className="liquid-glass-soft rounded-[2rem] px-6 py-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Mode behavior</p>
          <h2 className="mt-3 text-3xl font-semibold">Account and guest stay separate</h2>
          <ul className="mt-8 space-y-4 text-sm text-[var(--muted)]">
            <li className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
              Account mode writes only to <code>users/{"{uid}"}/...</code> in Firestore.
            </li>
            <li className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
              Guest mode writes only to <code>grubx_*</code> local storage keys.
            </li>
            <li className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
              Switching modes clears UI state immediately and never auto-merges records.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
