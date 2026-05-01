"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Database, Film, Plus, RotateCcw, Shield, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { useSettingsContext } from "@/context/SettingsContext";
import { GRUBX_PROVIDERS } from "@/lib/grubx/providers";
import { queryKeys } from "@/lib/queryKeys";
import type { CustomProviderSettings, Settings } from "@/types/settings";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] px-5 py-5 md:px-6 md:py-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/35 text-[var(--accent)]">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-black/22 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function SelectSetting<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="min-h-11 rounded-full border border-white/10 bg-black/45 px-4 text-sm font-semibold text-white outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

const createCustomProviderId = (name: string) =>
  `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42)}-${Date.now()}`;

export function SettingsPanel() {
  const [isPending, startTransition] = useTransition();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customPattern, setCustomPattern] = useState("");
  const queryClient = useQueryClient();
  const { ready, settings, resetSettings, updateSettings, clearAllData } = useSettingsContext();

  const enabledBuiltInCount = useMemo(
    () =>
      GRUBX_PROVIDERS.filter(
        (provider) =>
          provider.enabled &&
          provider.safety !== "blocked" &&
          settings.providerSettings[provider.id] !== false,
      ).length,
    [settings.providerSettings],
  );

  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K], message: string) => {
    startTransition(async () => {
      await updateSettings({ [key]: value });
      toast.success(message);
    });
  };

  const setProviderEnabled = (providerId: string, enabled: boolean) => {
    setSetting(
      "providerSettings",
      {
        ...settings.providerSettings,
        [providerId]: enabled,
      },
      enabled ? "Provider enabled." : "Provider disabled.",
    );
  };

  const addCustomProvider = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextProvider: CustomProviderSettings = {
      id: createCustomProviderId(customName),
      name: customName.trim(),
      baseUrl: customBaseUrl.trim(),
      embedUrlPattern: customPattern.trim(),
      enabled: true,
      supportsMovie: true,
      supportsTv: true,
    };

    startTransition(async () => {
      await updateSettings({ customProviders: [...settings.customProviders, nextProvider] });
      setCustomName("");
      setCustomBaseUrl("");
      setCustomPattern("");
      toast.success("Custom provider added.");
    });
  };

  const updateCustomProvider = (providerId: string, next: Partial<CustomProviderSettings>) => {
    setSetting(
      "customProviders",
      settings.customProviders.map((provider) =>
        provider.id === providerId ? { ...provider, ...next } : provider,
      ),
      "Custom provider updated.",
    );
  };

  const removeCustomProvider = (providerId: string) => {
    setSetting(
      "customProviders",
      settings.customProviders.filter((provider) => provider.id !== providerId),
      "Custom provider removed.",
    );
  };

  if (!ready) {
    return <LoadingState title="Loading settings" description="Restoring your local control panel." />;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] px-5 py-7 md:px-7 md:py-9">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent)]">Control Center</p>
        <h1 className="mt-4 text-4xl font-bold leading-none md:text-5xl">Tune GrubX</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Every control here is stored locally on this device. No account sync and no background version checks.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await resetSettings();
                toast.success("Settings reset.");
              })
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-5 text-sm font-semibold text-white transition hover:border-white/20"
          >
            <RotateCcw className="size-4" />
            Reset settings
          </button>
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-300/20 bg-red-500/10 px-5 text-sm font-semibold text-red-100 transition hover:border-red-200/35"
          >
            <Trash2 className="size-4" />
            Clear All Cache & Data
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Section icon={Shield} title="Safety" description="Safe browsing and popup behavior for external embeds.">
          <SettingRow title="SAFE_MODE" description="Strict mode watches links, popups, redirects, and overlay traps.">
            <ToggleSwitch
              checked={settings.safeMode}
              onChange={(checked) => setSetting("safeMode", checked, "Safe mode updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow
            title="Popup blocker strictness"
            description="Low only blocks known bad domains. High is more cautious around new-window behavior."
          >
            <SelectSetting
              value={settings.popupBlockerStrictness}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
              onChange={(value) => setSetting("popupBlockerStrictness", value, "Popup strictness updated.")}
            />
          </SettingRow>
          <SettingRow title="Avoid limited-protection servers" description="Prefer providers that work inside strict sandboxing.">
            <ToggleSwitch
              checked={settings.avoidLimitedProtectionServers}
              onChange={(checked) => setSetting("avoidLimitedProtectionServers", checked, "Server preference updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow
            title="Allow limited-protection providers"
            description="These providers may show unsafe ads or popups. Keep this off unless you are testing."
          >
            <ToggleSwitch
              checked={settings.allowLimitedProtectionProviders}
              onChange={(checked) => setSetting("allowLimitedProtectionProviders", checked, "Limited provider access updated.")}
              disabled={isPending}
            />
          </SettingRow>
        </Section>

        <Section icon={Film} title="Playback" description="Player defaults, recommendations, and embed quality.">
          <SettingRow title="Recommendation system" description="Use local views, clicks, saves, filters, and searches to personalize rows.">
            <ToggleSwitch
              checked={settings.recommendationsEnabled}
              onChange={(checked) => setSetting("recommendationsEnabled", checked, "Recommendations updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow title="Autoplay" description="Start playback automatically when the selected provider supports it.">
            <ToggleSwitch
              checked={settings.autoplayPlayback}
              onChange={(checked) => setSetting("autoplayPlayback", checked, "Autoplay updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow title="Embed quality mode" description="Choose how provider embeds should balance quality and bandwidth.">
            <SelectSetting
              value={settings.embedQualityMode}
              options={[
                { value: "auto", label: "Auto" },
                { value: "data-saver", label: "Data saver" },
                { value: "high", label: "High quality" },
              ]}
              onChange={(value) => setSetting("embedQualityMode", value, "Embed quality updated.")}
            />
          </SettingRow>
          <SettingRow title="Poster quality" description="Controls catalog artwork quality across the app.">
            <SelectSetting
              value={settings.posterQuality}
              options={[
                { value: "balanced", label: "Balanced" },
                { value: "high", label: "High quality" },
                { value: "data-saver", label: "Data saver" },
              ]}
              onChange={(value) => setSetting("posterQuality", value, "Poster quality updated.")}
            />
          </SettingRow>
        </Section>
      </div>

      <Section
        icon={Database}
        title="Providers"
        description={`${enabledBuiltInCount} built-in provider${enabledBuiltInCount === 1 ? "" : "s"} enabled. Custom providers are stored locally and are not treated as built-in safe providers.`}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {GRUBX_PROVIDERS.map((provider) => {
            const blocked = provider.safety === "blocked" || !provider.enabled;
            return (
              <SettingRow
                key={provider.id}
                title={provider.name}
                description={blocked ? provider.notes ?? "This provider is unavailable." : provider.baseUrl}
              >
                <ToggleSwitch
                  checked={!blocked && settings.providerSettings[provider.id] !== false}
                  onChange={(checked) => setProviderEnabled(provider.id, checked)}
                  disabled={isPending || blocked}
                />
              </SettingRow>
            );
          })}
        </div>

        <form onSubmit={addCustomProvider} className="mt-5 rounded-[1rem] border border-white/8 bg-black/22 p-4">
          <h3 className="text-base font-semibold text-white">Add custom provider</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Use placeholders like {"{id}"}, {"{season}"}, and {"{episode}"}. Custom providers do not include built-in ad/popup review yet.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <input
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              required
              placeholder="Provider name"
              className="min-h-11 rounded-full border border-white/10 bg-black/45 px-4 text-sm text-white outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={customBaseUrl}
              onChange={(event) => setCustomBaseUrl(event.target.value)}
              required
              placeholder="https://example.com"
              className="min-h-11 rounded-full border border-white/10 bg-black/45 px-4 text-sm text-white outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={customPattern}
              onChange={(event) => setCustomPattern(event.target.value)}
              required
              placeholder="https://example.com/embed/movie/{id}"
              className="min-h-11 rounded-full border border-white/10 bg-black/45 px-4 text-sm text-white outline-none placeholder:text-[var(--muted)]"
            />
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-black transition hover:brightness-95"
          >
            <Plus className="size-4" />
            Add provider
          </button>
        </form>

        {settings.customProviders.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {settings.customProviders.map((provider) => (
              <div key={provider.id} className="rounded-[1rem] border border-white/8 bg-black/22 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{provider.name}</h3>
                    <p className="mt-1 break-all text-sm text-[var(--muted)]">{provider.embedUrlPattern}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={provider.enabled}
                      onChange={(checked) => updateCustomProvider(provider.id, { enabled: checked })}
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomProvider(provider.id)}
                      className="grid min-h-11 min-w-11 place-items-center rounded-full border border-white/10 bg-white/6 text-[var(--muted)] transition hover:text-white"
                      aria-label="Remove custom provider"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Section>

      {confirmClearOpen ? (
        <div className="fixed inset-0 z-[500] grid place-items-center bg-black/78 px-4 backdrop-blur-xl">
          <div className="liquid-glass max-w-lg rounded-[1.25rem] p-5 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">Clear All Cache & Data?</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              This clears localStorage, sessionStorage, cached responses, watchlist, continue watching, settings, and recommendation history on this device.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="min-h-11 rounded-full border border-white/10 bg-white/6 px-5 text-sm font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await clearAllData();
                    queryClient.clear();
                    queryClient.setQueryData(queryKeys.watchlist, []);
                    queryClient.setQueryData(queryKeys.continueWatching, []);
                    setConfirmClearOpen(false);
                    toast.success("Local cache and data cleared.");
                  })
                }
                className="min-h-11 rounded-full bg-red-200 px-5 text-sm font-bold text-black"
              >
                Clear everything
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
