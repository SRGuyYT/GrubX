"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { env } from "@/lib/env";
import { useSession } from "@/context/SessionContext";

export default function LoginPage() {
  const router = useRouter();
  const { session, login, loginWithGithub, loginWithMatrix } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [matrixUsername, setMatrixUsername] = useState("");
  const [matrixPassword, setMatrixPassword] = useState("");
  const [homeserverUrl, setHomeserverUrl] = useState("");

  useEffect(() => {
    if (session.status === "authenticated") {
      router.replace("/settings");
    }
  }, [router, session.status]);

  const isBusy = session.status === "authenticating" || session.status === "bridging";

  return (
    <div className="page-shell py-12">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="liquid-glass rounded-[2rem] px-6 py-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Account login</p>
          <h1 className="mt-3 text-4xl font-semibold">Return to your account</h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Firebase email/password and GitHub are still supported. Account mode only becomes active after
            Firebase resolves your UID.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void login(email, password)
                .then(() => {
                  toast.success("Signed in.");
                  router.push("/settings");
                })
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Sign-in failed."));
            }}
          >
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
              autoComplete="current-password"
              className="liquid-glass-soft w-full rounded-full px-5 py-4 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="w-full rounded-full bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Continue with email
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
            Need an account?{" "}
            <Link href="/register" className="text-white underline decoration-white/20 underline-offset-4">
              Register here
            </Link>
          </p>
        </section>

        <section className="liquid-glass-soft rounded-[2rem] px-6 py-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Matrix bridge</p>
          <h2 className="mt-3 text-3xl font-semibold">Optional Matrix sign-in</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Matrix sessions are bridged into Firebase custom tokens before any Firestore access.
          </p>

          {env.matrixBridgeEnabled ? (
            <form
              className="mt-8 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void loginWithMatrix({
                  username: matrixUsername,
                  password: matrixPassword,
                  homeserverUrl,
                })
                  .then(() => {
                    toast.success("Signed in with Matrix.");
                    router.push("/settings");
                  })
                  .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Matrix sign-in failed."));
              }}
            >
              <input
                value={homeserverUrl}
                onChange={(event) => setHomeserverUrl(event.target.value)}
                placeholder="Homeserver URL (optional override)"
                className="w-full rounded-full border border-white/10 bg-black/20 px-5 py-4 text-sm outline-none"
              />
              <input
                value={matrixUsername}
                onChange={(event) => setMatrixUsername(event.target.value)}
                placeholder="Matrix username"
                autoComplete="username"
                className="w-full rounded-full border border-white/10 bg-black/20 px-5 py-4 text-sm outline-none"
              />
              <input
                type="password"
                value={matrixPassword}
                onChange={(event) => setMatrixPassword(event.target.value)}
                placeholder="Matrix password"
                autoComplete="current-password"
                className="w-full rounded-full border border-white/10 bg-black/20 px-5 py-4 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={isBusy}
                className="w-full rounded-full border border-white/10 px-5 py-4 text-sm font-semibold text-white transition hover:border-white/20 disabled:opacity-60"
              >
                Continue with Matrix
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-5 text-sm text-[var(--muted)]">
              Matrix bridge is disabled until <code>NEXT_PUBLIC_MATRIX_BRIDGE_ENABLED=true</code> and
              the server-side Firebase Admin credentials are configured.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
