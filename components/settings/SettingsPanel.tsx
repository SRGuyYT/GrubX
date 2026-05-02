"use client";

import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bug,
  Database,
  Download,
  Film,
  MonitorPlay,
  Navigation,
  Palette,
  Plus,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { useSettingsContext } from "@/context/SettingsContext";
import { GRUBX_PROVIDERS } from "@/lib/grubx/providers";
import { DEFAULT_FEATURE_TOGGLES, DEFAULT_SETTINGS } from "@/lib/settings";
import {
  getAgeGateStatus,
  getRiskConsentAcceptedAt,
  hasRiskConsent,
  isUnder13Suspended,
  resetPlaybackSafetyConsent,
} from "@/lib/grubx/consent";
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

const featureRows: Array<{ key: keyof Settings["featureToggles"]; title: string; description: string }> = [
  { key: "movies", title: "Movies", description: "Movie catalog, title pages, and movie playback." },
  { key: "tv", title: "TV", description: "TV catalog, seasons, episodes, and TV playback." },
  { key: "live", title: "Live TV", description: "Live TV and sports page." },
  { key: "youtube", title: "YouTube", description: "YouTube search and embeds." },
  { key: "spotify", title: "Spotify / Music", description: "Spotify login, search, embeds, and music tools." },
  { key: "tiktok", title: "TikTok", description: "TikTok search and link embeds." },
  { key: "search", title: "Search", description: "Global movie and TV search." },
  { key: "watchlist", title: "Watchlist", description: "Saved titles and watchlist controls." },
  { key: "continueWatching", title: "Continue Watching", description: "Local playback progress rows." },
  { key: "aiServer", title: "AI Server", description: "AI Server navigation and page." },
  { key: "providerReports", title: "Provider Reports", description: "Report provider buttons and server alerts." },
  { key: "feedbackContact", title: "Feedback / Contact", description: "Feedback forms and contact page." },
  { key: "safetyLegalPages", title: "Safety / Legal Pages", description: "Safety, terms, and privacy links." },
  { key: "proxyPlayback", title: "Proxy Playback", description: "Allow proxy playback options where available." },
  { key: "thirdPartyPlayback", title: "Third-party Playback", description: "Allow third-party playback providers." },
  { key: "tvModeScreenMirroring", title: "TV Mode / Screen Mirroring", description: "TV mode and cast/mirror controls." },
];

export function SettingsPanel() {
  const [isPending, startTransition] = useTransition();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customPattern, setCustomPattern] = useState("");
  const [exportedSettings, setExportedSettings] = useState("");
  const [importSettingsJson, setImportSettingsJson] = useState("");
  const [consentSnapshot, setConsentSnapshot] = useState({
    ageGateStatus: "Not answered",
    riskConsent: "Not accepted",
    under13Suspended: false,
  });
  const queryClient = useQueryClient();
  const { ready, settings, resetSettings, updateSettings, clearAllData } = useSettingsContext();

  const enabledBuiltInCount = useMemo(
    () =>
      GRUBX_PROVIDERS.filter(
        (provider) =>
          provider.enabled &&
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

  const setFeatureToggle = (key: keyof Settings["featureToggles"], enabled: boolean) => {
    setSetting(
      "featureToggles",
      {
        ...settings.featureToggles,
        [key]: enabled,
      },
      enabled ? "Feature enabled." : "Feature disabled.",
    );
  };

  const resetProviderPreferences = () => {
    try {
      window.localStorage.removeItem("grubx.providerReports");
      window.localStorage.removeItem("grubx.providerFailures");
      window.localStorage.removeItem("grubx.providerSuccesses");
      window.localStorage.removeItem("grubx.preferredProvider");
      window.localStorage.removeItem("grubx.blockedProviders");
    } catch {
      // Local storage may be unavailable in privacy modes.
    }
    setSetting("providerSettings", DEFAULT_SETTINGS.providerSettings, "Provider preferences reset.");
  };

  const exportCurrentSettings = () => {
    const payload = JSON.stringify(settings, null, 2);
    setExportedSettings(payload);
    void navigator.clipboard?.writeText(payload).catch(() => undefined);
    toast.success("Settings exported. The JSON was copied when clipboard access was available.");
  };

  const importSettings = () => {
    startTransition(async () => {
      try {
        const parsed = JSON.parse(importSettingsJson) as Partial<Settings>;
        await updateSettings(parsed);
        toast.success("Settings imported.");
      } catch {
        toast.error("That settings JSON could not be imported.");
      }
    });
  };

  const testMatrixFeedback = () => {
    startTransition(async () => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          category: "other",
          area: "settings",
          priority: "low",
          title: "Settings test feedback",
          message: "An admin tested the GrubX feedback pipeline from Settings.",
          pageUrl: "/settings",
        }),
      });
      toast[response.ok ? "success" : "error"](response.ok ? "Feedback test sent." : "Feedback test failed.");
    });
  };

  const testProviderReport = () => {
    startTransition(async () => {
      const provider = GRUBX_PROVIDERS[0];
      const response = await fetch("/api/provider-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          providerId: provider.id,
          providerName: provider.name,
          reason: "other",
          title: "Settings test report",
          pageUrl: "/settings",
          details: "An admin tested the provider report pipeline from Settings.",
        }),
      });
      toast[response.ok ? "success" : "error"](response.ok ? "Provider report test sent." : "Provider report test failed.");
    });
  };

  const refreshConsentSnapshot = () => {
    const ageGateStatus = getAgeGateStatus();
    const riskAcceptedAt = getRiskConsentAcceptedAt();
    setConsentSnapshot({
      ageGateStatus: ageGateStatus === "13plus" ? "13 or older" : ageGateStatus === "under13" ? "Under 13" : "Not answered",
      riskConsent: hasRiskConsent() ? `Accepted${riskAcceptedAt ? ` on ${new Date(riskAcceptedAt).toLocaleString()}` : ""}` : "Not accepted",
      under13Suspended: isUnder13Suspended(),
    });
  };

  useEffect(() => {
    refreshConsentSnapshot();
  }, []);

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

      <Section
        icon={SlidersHorizontal}
        title="Feature Toggles"
        description="Turn major GrubX areas on or off. Disabled nav items disappear, but direct links show a clean disabled screen."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {featureRows.map((feature) => (
            <SettingRow key={feature.key} title={feature.title} description={feature.description}>
              <ToggleSwitch
                checked={settings.featureToggles[feature.key]}
                onChange={(checked) => setFeatureToggle(feature.key, checked)}
                disabled={isPending || feature.key === "safetyLegalPages"}
              />
            </SettingRow>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSetting("featureToggles", DEFAULT_FEATURE_TOGGLES, "Feature toggles reset.")}
            className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white"
          >
            Reset feature toggles
          </button>
        </div>
      </Section>

      <div className="grid gap-8 xl:grid-cols-2">
        <Section icon={MonitorPlay} title="Playback & Providers" description="Control third-party playback, server behavior, and player warnings.">
          <SettingRow title="Enable third-party playback" description="Allow movie and TV playback through third-party providers.">
            <ToggleSwitch
              checked={settings.featureToggles.thirdPartyPlayback}
              onChange={(checked) => setFeatureToggle("thirdPartyPlayback", checked)}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow title="Enable proxy playback" description="Allow proxy playback options when your deployment supports them.">
            <ToggleSwitch
              checked={settings.featureToggles.proxyPlayback}
              onChange={(checked) => setFeatureToggle("proxyPlayback", checked)}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow title="Default playback mode" description="Choose how GrubX should prefer direct or proxy playback.">
            <SelectSetting
              value={settings.playbackMode}
              options={[
                { value: "direct", label: "Direct" },
                { value: "proxy", label: "Proxy" },
                { value: "auto", label: "Auto" },
              ]}
              onChange={(value) => setSetting("playbackMode", value, "Playback mode updated.")}
            />
          </SettingRow>
          <SettingRow title="Default provider" description="Pick the first server GrubX should try when available.">
            <SelectSetting
              value={settings.defaultProvider}
              options={GRUBX_PROVIDERS.map((provider) => ({ value: provider.id, label: provider.name }))}
              onChange={(value) => setSetting("defaultProvider", value, "Default provider updated.")}
            />
          </SettingRow>
          <SettingRow title="Enable server switcher" description="Show server choices inside the player.">
            <ToggleSwitch
              checked={settings.enableServerSwitcher}
              onChange={(checked) => setSetting("enableServerSwitcher", checked, "Server switcher updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow title="Enable autoplay if supported" description="Ask providers to start playback automatically when they support it.">
            <ToggleSwitch
              checked={settings.autoplayPlayback}
              onChange={(checked) => setSetting("autoplayPlayback", checked, "Autoplay updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow title="Show playback warnings" description="Show user-facing warnings before risky third-party playback.">
            <ToggleSwitch
              checked={settings.showPlaybackWarnings}
              onChange={(checked) => setSetting("showPlaybackWarnings", checked, "Playback warnings updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <button
            type="button"
            onClick={resetProviderPreferences}
            className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white"
          >
            Reset provider preferences
          </button>
        </Section>

        <Section icon={Youtube} title="External Media" description="Control YouTube, Spotify, and TikTok behavior.">
          <SettingRow title="Enable YouTube" description="Show YouTube in nav and allow direct access to the YouTube page.">
            <ToggleSwitch checked={settings.featureToggles.youtube} onChange={(checked) => setFeatureToggle("youtube", checked)} disabled={isPending} />
          </SettingRow>
          <SettingRow title="Enable Spotify" description="Show Spotify / Music in nav and allow direct access to music tools.">
            <ToggleSwitch checked={settings.featureToggles.spotify} onChange={(checked) => setFeatureToggle("spotify", checked)} disabled={isPending} />
          </SettingRow>
          <SettingRow title="Enable TikTok" description="Show TikTok in nav and allow direct access to TikTok embeds.">
            <ToggleSwitch checked={settings.featureToggles.tiktok} onChange={(checked) => setFeatureToggle("tiktok", checked)} disabled={isPending} />
          </SettingRow>
          <SettingRow title="YouTube safe search" description="Choose the default YouTube search safety level.">
            <SelectSetting
              value={settings.youtubeSafeSearch}
              options={[
                { value: "strict", label: "Strict" },
                { value: "moderate", label: "Moderate" },
                { value: "off", label: "Off" },
              ]}
              onChange={(value) => setSetting("youtubeSafeSearch", value, "YouTube safe search updated.")}
            />
          </SettingRow>
          <SettingRow title="YouTube result count" description="Choose how many YouTube results to request.">
            <SelectSetting
              value={String(settings.youtubeResultCount)}
              options={[
                { value: "8", label: "8" },
                { value: "12", label: "12" },
                { value: "20", label: "20" },
              ]}
              onChange={(value) => setSetting("youtubeResultCount", Number(value) as Settings["youtubeResultCount"], "YouTube result count updated.")}
            />
          </SettingRow>
          <SettingRow title="Spotify embed size" description="Choose compact or large Spotify embeds.">
            <SelectSetting
              value={settings.spotifyEmbedSize}
              options={[
                { value: "compact", label: "Compact" },
                { value: "large", label: "Large" },
              ]}
              onChange={(value) => setSetting("spotifyEmbedSize", value, "Spotify embed size updated.")}
            />
          </SettingRow>
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await updateSettings({
                  youtubeSafeSearch: DEFAULT_SETTINGS.youtubeSafeSearch,
                  youtubeResultCount: DEFAULT_SETTINGS.youtubeResultCount,
                  spotifyEmbedSize: DEFAULT_SETTINGS.spotifyEmbedSize,
                  featureToggles: {
                    ...settings.featureToggles,
                    youtube: true,
                    spotify: true,
                    tiktok: true,
                  },
                });
                toast.success("External media settings reset.");
              })
            }
            className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white"
          >
            Reset external media settings
          </button>
        </Section>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Section icon={Palette} title="Appearance" description="Adjust the Cinematic Console look without leaving the default design language.">
          <SettingRow title="Theme mode" description="Choose system-style dark, dark, or AMOLED output.">
            <SelectSetting
              value={settings.amoledMode ? "amoled" : settings.uiTheme}
              options={[
                { value: "system", label: "System" },
                { value: "dark", label: "Dark" },
                { value: "amoled", label: "AMOLED" },
              ]}
              onChange={(value) => {
                void updateSettings({ uiTheme: value === "system" ? "dark" : "dark", amoledMode: value === "amoled" });
                toast.success("Theme mode updated.");
              }}
            />
          </SettingRow>
          <SettingRow title="Accent tone" description="Change the warm accent used for active states.">
            <SelectSetting
              value={settings.accentTone}
              options={[
                { value: "ember", label: "Ember" },
                { value: "electric", label: "Electric" },
                { value: "aurora", label: "Aurora" },
              ]}
              onChange={(value) => setSetting("accentTone", value, "Accent tone updated.")}
            />
          </SettingRow>
          <SettingRow title="Card density" description="Adjust card spacing and browsing density.">
            <SelectSetting
              value={settings.cardDensity}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
              onChange={(value) => setSetting("cardDensity", value, "Card density updated.")}
            />
          </SettingRow>
          <SettingRow title="Blur strength" description="Control glass blur intensity.">
            <SelectSetting
              value={settings.blurStrength}
              options={[
                { value: "soft", label: "Soft" },
                { value: "balanced", label: "Balanced" },
                { value: "intense", label: "Intense" },
              ]}
              onChange={(value) => setSetting("blurStrength", value, "Blur strength updated.")}
            />
          </SettingRow>
          <SettingRow title="Compact mode" description="Tighten spacing across rows and cards.">
            <ToggleSwitch checked={settings.compactMode} onChange={(checked) => setSetting("compactMode", checked, "Compact mode updated.")} disabled={isPending} />
          </SettingRow>
          <SettingRow title="Reduce motion" description="Reduce animation and hover motion.">
            <ToggleSwitch checked={!settings.enableAnimations} onChange={(checked) => setSetting("enableAnimations", !checked, "Motion preference updated.")} disabled={isPending} />
          </SettingRow>
          <SettingRow title="Poster size" description="Control poster image quality and bandwidth.">
            <SelectSetting
              value={settings.posterQuality}
              options={[
                { value: "data-saver", label: "Small" },
                { value: "balanced", label: "Medium" },
                { value: "high", label: "Large" },
              ]}
              onChange={(value) => setSetting("posterQuality", value, "Poster size updated.")}
            />
          </SettingRow>
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await updateSettings({
                  uiTheme: DEFAULT_SETTINGS.uiTheme,
                  amoledMode: DEFAULT_SETTINGS.amoledMode,
                  accentTone: DEFAULT_SETTINGS.accentTone,
                  cardDensity: DEFAULT_SETTINGS.cardDensity,
                  blurStrength: DEFAULT_SETTINGS.blurStrength,
                  compactMode: DEFAULT_SETTINGS.compactMode,
                  enableAnimations: DEFAULT_SETTINGS.enableAnimations,
                  posterQuality: DEFAULT_SETTINGS.posterQuality,
                });
                toast.success("Appearance settings reset.");
              })
            }
            className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white"
          >
            Reset appearance settings
          </button>
        </Section>

        <Section icon={Navigation} title="Navigation" description="Control nav visibility and how external AI opens.">
          <SettingRow title="Navigation style" description="Choose a desktop nav shape.">
            <SelectSetting
              value={settings.navStyle}
              options={[
                { value: "floating", label: "Floating" },
                { value: "top-bar", label: "Top bar" },
                { value: "compact", label: "Compact" },
              ]}
              onChange={(value) => setSetting("navStyle", value, "Navigation style updated.")}
            />
          </SettingRow>
          <SettingRow title="Mobile nav style" description="Choose the mobile navigation behavior.">
            <SelectSetting
              value={settings.mobileNavStyle}
              options={[
                { value: "bottom-bar", label: "Bottom bar" },
                { value: "drawer", label: "Drawer" },
              ]}
              onChange={(value) => setSetting("mobileNavStyle", value, "Mobile nav style updated.")}
            />
          </SettingRow>
          <SettingRow title="Open AI Server" description="Choose whether AI opens in GrubX or a new tab.">
            <SelectSetting
              value={settings.aiOpenMode}
              options={[
                { value: "same-tab", label: "Same tab" },
                { value: "new-tab", label: "New tab" },
              ]}
              onChange={(value) => setSetting("aiOpenMode", value, "AI Server behavior updated.")}
            />
          </SettingRow>
          <div className="grid gap-3 md:grid-cols-2">
            {featureRows
              .filter((feature) => ["movies", "tv", "live", "youtube", "spotify", "tiktok", "search", "aiServer"].includes(feature.key))
              .map((feature) => (
                <SettingRow key={feature.key} title={`Show ${feature.title}`} description="Show or hide this item in navigation.">
                  <ToggleSwitch checked={settings.featureToggles[feature.key]} onChange={(checked) => setFeatureToggle(feature.key, checked)} disabled={isPending} />
                </SettingRow>
              ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Section icon={Shield} title="Playback Safety & Compatibility" description="Age gate, risk consent, and compatibility playback controls.">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1rem] border border-white/8 bg-black/22 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Age gate</p>
              <p className="mt-2 text-sm font-semibold text-white">{consentSnapshot.ageGateStatus}</p>
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-black/22 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Risk consent</p>
              <p className="mt-2 text-sm font-semibold text-white">{consentSnapshot.riskConsent}</p>
            </div>
            <div className="rounded-[1rem] border border-white/8 bg-black/22 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Under-13 suspension</p>
              <p className="mt-2 text-sm font-semibold text-white">{consentSnapshot.under13Suspended ? "Active" : "Not active"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                resetPlaybackSafetyConsent();
                refreshConsentSnapshot();
                toast.success("Playback safety consent reset.");
              }}
              className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white"
            >
              Reset consent
            </button>
            <Link href="/safety" className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white">
              Safety page
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white">
              Terms page
            </Link>
          </div>
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
          <SettingRow title="Prefer standard servers" description="Try standard providers before compatibility providers when both are available.">
            <ToggleSwitch
              checked={settings.avoidLimitedProtectionServers}
              onChange={(checked) => setSetting("avoidLimitedProtectionServers", checked, "Server preference updated.")}
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
            const unavailable = !provider.enabled;
            const label =
              provider.safety === "standard"
                ? "Standard"
                : provider.safety === "reported"
                  ? "Reported by users"
                  : "Compatibility";
            return (
              <SettingRow
                key={provider.id}
                title={`${provider.name} - ${label}`}
                description={provider.notes ?? provider.baseUrl}
              >
                <ToggleSwitch
                  checked={!unavailable && settings.providerSettings[provider.id] !== false}
                  onChange={(checked) => setProviderEnabled(provider.id, checked)}
                  disabled={isPending || unavailable}
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

      <Section icon={Bug} title="Admin / Debug" description="Safe diagnostics and local data tools. Secrets and webhook URLs are never shown here.">
        <div className="grid gap-3 md:grid-cols-2">
          <SettingRow title="Show build/version info" description="Show local build information in admin panels.">
            <ToggleSwitch
              checked={settings.showBuildInfo}
              onChange={(checked) => setSetting("showBuildInfo", checked, "Build info visibility updated.")}
              disabled={isPending}
            />
          </SettingRow>
          <SettingRow title="Show update status" description="Show update status fields for debugging only.">
            <ToggleSwitch
              checked={settings.showUpdateStatus}
              onChange={(checked) => setSetting("showUpdateStatus", checked, "Update status visibility updated.")}
              disabled={isPending}
            />
          </SettingRow>
        </div>
        {settings.showBuildInfo ? (
          <div className="rounded-[1rem] border border-white/8 bg-black/22 px-4 py-4 text-sm leading-6 text-[var(--muted)]">
            <p className="font-semibold text-white">GrubX local build</p>
            <p>Next.js app router build. Settings are stored locally on this device.</p>
            {settings.showUpdateStatus ? <p>Update status: manual deployment controls only.</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={testMatrixFeedback}
            className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white"
          >
            Test Matrix feedback
          </button>
          <button
            type="button"
            onClick={testProviderReport}
            disabled={!settings.featureToggles.providerReports}
            className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Test provider report
          </button>
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex min-h-11 items-center rounded-full border border-red-300/20 bg-red-500/10 px-5 text-sm font-semibold text-red-100"
          >
            Clear local GrubX data
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1rem] border border-white/8 bg-black/22 p-4">
            <h3 className="text-base font-semibold text-white">Export settings JSON</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Copy your local settings for backup or transfer.</p>
            <button
              type="button"
              onClick={exportCurrentSettings}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-black"
            >
              <Download className="size-4" />
              Export settings
            </button>
            {exportedSettings ? (
              <textarea
                readOnly
                value={exportedSettings}
                rows={8}
                className="mt-4 w-full resize-y rounded-[0.95rem] border border-white/10 bg-black/45 px-4 py-3 text-xs leading-5 text-white outline-none"
              />
            ) : null}
          </div>
          <div className="rounded-[1rem] border border-white/8 bg-black/22 p-4">
            <h3 className="text-base font-semibold text-white">Import settings JSON</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Paste exported settings. Invalid or old fields are safely ignored.</p>
            <textarea
              value={importSettingsJson}
              onChange={(event) => setImportSettingsJson(event.target.value)}
              rows={8}
              placeholder='{"featureToggles":{"movies":true}}'
              className="mt-4 w-full resize-y rounded-[0.95rem] border border-white/10 bg-black/45 px-4 py-3 text-xs leading-5 text-white outline-none placeholder:text-[var(--muted)]"
            />
            <button
              type="button"
              onClick={importSettings}
              disabled={!importSettingsJson.trim()}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="size-4" />
              Import settings
            </button>
          </div>
        </div>
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
