"use client";

import { useTransition } from "react";
import { Film, HardDriveDownload, ShieldBan, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";

import { ContinueWatchingRow } from "@/components/user/ContinueWatchingRow";
import { WatchlistRow } from "@/components/user/WatchlistRow";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useSettingsContext } from "@/context/SettingsContext";
import { useSession } from "@/context/SessionContext";

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="liquid-glass-soft flex items-center justify-between gap-4 rounded-[1.65rem] px-5 py-5 md:px-6">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function SettingsPanel() {
  const [isPending, startTransition] = useTransition();
  const { ready, error, settings, setGuestMode, updateSettings } = useSettingsContext();
  const { user, session } = useSession();

  if (!ready) {
    return <LoadingState title="Loading settings" description="Hydrating your active data mode." />;
  }

  const canUseAccountMode = session.status === "authenticated" && Boolean(user);

  return (
    <section className="space-y-7">
      <div className="liquid-glass rounded-[2.2rem] px-6 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
            <UserRound className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Guest and account data stay isolated. Switching modes never merges watchlists, playback
              progress, or settings.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-[1.4rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Settings fell back to safe defaults because the active mode store could not be read: {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <SettingRow
            title="Guest Mode"
            description={
              canUseAccountMode
                ? "Keep activity in local storage only. Switching back to account mode restores Firebase-backed data."
                : "Guest mode is active until you sign in with Firebase or GitHub."
            }
            checked={settings.guestMode}
            disabled={!canUseAccountMode || isPending}
            onChange={(checked) =>
              startTransition(async () => {
                await setGuestMode(checked);
                toast.success(checked ? "Guest mode enabled." : "Account mode enabled.");
              })
            }
          />

          <SettingRow
            title="Autoplay Trailers"
            description="If you explicitly open a trailer, GrubX can start playback immediately inside the modal."
            checked={settings.autoplayTrailers}
            disabled={isPending}
            onChange={(checked) =>
              startTransition(async () => {
                await updateSettings({ autoplayTrailers: checked });
                toast.success("Trailer setting updated.");
              })
            }
          />

          <SettingRow
            title="Enable Animations"
            description="Controls carousel motion and subtle UI transitions across the app."
            checked={settings.enableAnimations}
            disabled={isPending}
            onChange={(checked) =>
              startTransition(async () => {
                await updateSettings({ enableAnimations: checked });
                toast.success("Animation setting updated.");
              })
            }
          />

          <SettingRow
            title="Data Saver"
            description="Prefers lighter imagery and conservative media embeds when possible."
            checked={settings.dataSaver}
            disabled={isPending}
            onChange={(checked) =>
              startTransition(async () => {
                await updateSettings({ dataSaver: checked });
                toast.success("Data saver setting updated.");
              })
            }
          />

          <SettingRow
            title="Block Popups"
            description="When enabled, blocks popups and redirects within the embedded movie stream."
            checked={settings.blockPopups}
            disabled={isPending}
            onChange={(checked) =>
              startTransition(async () => {
                await updateSettings({ blockPopups: checked });
                toast.success("Popup setting updated.");
              })
            }
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: ShieldBan,
            title: "Popup Policy",
            description: "Hover, delayed, and autoplay popups are blocked globally.",
          },
          {
            icon: Film,
            title: "Playback Modes",
            description: "Theater mode expands the player while keeping the rest of the page dimmed.",
          },
          {
            icon: HardDriveDownload,
            title: "Storage Isolation",
            description: "Guest mode writes only grubx_* keys. Account mode writes only users/{uid}/*.",
          },
          {
            icon: Sparkles,
            title: "Hydration Safety",
            description: "Mode-aware UI waits for settings bootstrap before touching user-scoped data.",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div key={title} className="liquid-glass-soft rounded-[1.6rem] px-5 py-5">
            <Icon className="size-5 text-[var(--accent)]" />
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          </div>
        ))}
      </div>

      {session.status === "authenticated" ? (
        <div className="space-y-6">
          <div className="liquid-glass rounded-[2rem] px-6 py-7 md:px-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Account Data</p>
            <h2 className="mt-3 text-2xl font-semibold">Watchlist and Continue Watching</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Signed in as <span className="text-white">{user?.email ?? user?.username ?? "account user"}</span>.
              {settings.guestMode
                ? " Guest mode is still active, so Firebase-backed watchlist and playback history are paused until you switch back to account mode."
                : " Your Firebase-backed watchlist and playback history are active below."}
            </p>

            {settings.guestMode && canUseAccountMode ? (
              <div className="mt-5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await setGuestMode(false);
                      toast.success("Account mode enabled.");
                    })
                  }
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
                >
                  Use account mode
                </button>
              </div>
            ) : null}
          </div>

          {!settings.guestMode ? (
            <div className="space-y-8">
              <ContinueWatchingRow
                showEmpty
                title="Continue Watching"
                description="Resume titles synced to your account."
                emptyTitle="No account playback yet"
                emptyDescription="Once you start watching while account mode is active, your progress will show up here."
              />
              <WatchlistRow
                showEmpty
                title="Account Watchlist"
                description="Titles saved while account mode is active."
                emptyTitle="No saved titles yet"
                emptyDescription="Add a movie or show to your watchlist and it will appear here."
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
