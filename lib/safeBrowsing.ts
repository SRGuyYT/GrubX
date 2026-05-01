"use client";

import { useEffect } from "react";

import { appConfig } from "@/config/appConfig";
import type { PopupBlockerStrictness } from "@/types/settings";

export const SAFE_MODE = appConfig.SAFE_MODE;

const BLOCKED_DOMAIN_TERMS = ["porn", "xxx", "casino", "bet", "weed", "popup", "ads"];
const USER_GESTURE_WINDOW_MS = 700;
const SUSPICIOUS_LOAD_WINDOW_MS = 200;
const OVERLAY_SCAN_DEBOUNCE_MS = 220;

type SafeBrowsingOptions = {
  enabled?: boolean;
  safeMode?: boolean;
  strictness?: PopupBlockerStrictness;
  whitelist?: readonly string[];
  onBlock?: (message: string) => void;
};

const parseUrl = (value: string | URL | undefined | null) => {
  if (!value || typeof window === "undefined") {
    return null;
  }

  try {
    return new URL(String(value), window.location.href);
  } catch {
    return null;
  }
};

const normalizeHost = (host: string) => host.replace(/^www\./i, "").toLowerCase();

const isWhitelisted = (url: URL, whitelist: readonly string[]) => {
  const hostname = normalizeHost(url.hostname);
  return whitelist.some((entry) => {
    const normalized = normalizeHost(entry);
    return hostname === normalized || hostname.endsWith(`.${normalized}`);
  });
};

const isKnownBadDomain = (url: URL) => {
  const hostname = normalizeHost(url.hostname);
  return BLOCKED_DOMAIN_TERMS.some((term) => hostname.includes(term));
};

const shouldBlockUrl = ({
  value,
  safeMode,
  strictness,
  whitelist,
  userInitiated,
  installedAt,
}: {
  value: string | URL | undefined | null;
  safeMode: boolean;
  strictness: PopupBlockerStrictness;
  whitelist: readonly string[];
  userInitiated: boolean;
  installedAt: number;
}) => {
  const parsed = parseUrl(value);
  if (!parsed || parsed.origin === window.location.origin || isWhitelisted(parsed, whitelist)) {
    return false;
  }

  if (isKnownBadDomain(parsed)) {
    return true;
  }

  if (!safeMode || userInitiated || strictness === "low") {
    return false;
  }

  const suspiciouslySoonAfterLoad = Date.now() - installedAt < SUSPICIOUS_LOAD_WINDOW_MS;
  return strictness === "high" || suspiciouslySoonAfterLoad;
};

const disableOverlayTrap = (element: Element) => {
  if (!(element instanceof HTMLElement) || element.dataset.safeBrowsingDisabled === "true") {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.pointerEvents === "none" || style.visibility === "hidden" || style.display === "none") {
    return false;
  }

  if (style.position !== "fixed") {
    return false;
  }

  const zIndex = Number.parseInt(style.zIndex, 10);
  const opacity = Number.parseFloat(style.opacity || "1");
  const rect = element.getBoundingClientRect();
  const coversEnoughScreen = rect.width * rect.height > window.innerWidth * window.innerHeight * 0.2;

  if (Number.isFinite(zIndex) && zIndex >= 1000 && opacity <= 0.08 && coversEnoughScreen) {
    element.dataset.safeBrowsingDisabled = "true";
    element.style.pointerEvents = "none";
    element.setAttribute("aria-hidden", "true");
    return true;
  }

  return false;
};

export function installSafeBrowsing(options: SafeBrowsingOptions = {}) {
  const enabled = options.enabled ?? true;
  if (!enabled || typeof window === "undefined") {
    return () => undefined;
  }

  const safeMode = options.safeMode ?? SAFE_MODE;
  const strictness = options.strictness ?? "medium";
  const whitelist = options.whitelist ?? appConfig.whitelist;
  const notify = options.onBlock ?? (() => undefined);
  const nativeOpen = window.open.bind(window);
  const nativeAssign = window.location.assign.bind(window.location);
  const nativeReplace = window.location.replace.bind(window.location);
  const locationPrototype = Object.getPrototypeOf(window.location) as Location;
  const originalAssignDescriptor = Object.getOwnPropertyDescriptor(locationPrototype, "assign");
  const originalReplaceDescriptor = Object.getOwnPropertyDescriptor(locationPrototype, "replace");
  const installedAt = Date.now();
  let lastUserGestureAt = 0;
  let scanTimeout: number | null = null;
  let scanFrame = 0;

  const userInitiated = () => Date.now() - lastUserGestureAt < USER_GESTURE_WINDOW_MS;
  const markUserGesture = () => {
    lastUserGestureAt = Date.now();
  };

  const shouldBlock = (value: string | URL | undefined | null) =>
    shouldBlockUrl({
      value,
      safeMode,
      strictness,
      whitelist,
      userInitiated: userInitiated(),
      installedAt,
    });

  window.open = ((url?: string | URL, target?: string, features?: string) => {
    if (shouldBlock(url)) {
      notify("GrubX blocked a suspicious popup before it opened.");
      return null;
    }

    return nativeOpen(url, target, features);
  }) as typeof window.open;

  const guardedAssign = (url: string | URL) => {
    if (shouldBlock(url)) {
      notify("GrubX blocked a suspicious redirect.");
      return;
    }

    nativeAssign(url);
  };

  const guardedReplace = (url: string | URL) => {
    if (shouldBlock(url)) {
      notify("GrubX blocked a suspicious redirect.");
      return;
    }

    nativeReplace(url);
  };

  try {
    Object.defineProperty(locationPrototype, "assign", {
      configurable: true,
      value: guardedAssign,
    });
    Object.defineProperty(locationPrototype, "replace", {
      configurable: true,
      value: guardedReplace,
    });
  } catch {
    // Location methods may be locked by the browser.
  }

  const scanForOverlayTraps = (roots: Element[]) => {
    if (!safeMode || strictness === "low") {
      return;
    }

    if (scanTimeout !== null) {
      window.clearTimeout(scanTimeout);
    }

    scanTimeout = window.setTimeout(() => {
      window.cancelAnimationFrame(scanFrame);
      scanFrame = window.requestAnimationFrame(() => {
        let removedCount = 0;
        roots.slice(0, 80).forEach((root) => {
          if (disableOverlayTrap(root)) {
            removedCount += 1;
          }
          root.querySelectorAll?.("[style], div, a, button").forEach((element, index) => {
            if (index < 80 && disableOverlayTrap(element)) {
              removedCount += 1;
            }
          });
        });

        if (removedCount > 0) {
          notify("GrubX removed an invisible overlay trap.");
        }
      });
    }, OVERLAY_SCAN_DEBOUNCE_MS);
  };

  const onPointerCapture = () => markUserGesture();

  const onClickCapture = (event: MouseEvent) => {
    markUserGesture();
    const target = event.target as Element | null;
    const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;

    if (target && safeMode && disableOverlayTrap(target)) {
      event.preventDefault();
      event.stopPropagation();
      notify("GrubX blocked a hidden click trap.");
      return;
    }

    if (anchor && shouldBlock(anchor.href)) {
      event.preventDefault();
      event.stopPropagation();
      notify("GrubX blocked a suspicious link.");
    }
  };

  const onSubmitCapture = (event: SubmitEvent) => {
    markUserGesture();
    const form = event.target as HTMLFormElement | null;
    if (form?.action && shouldBlock(form.action)) {
      event.preventDefault();
      event.stopPropagation();
      notify("GrubX blocked a suspicious form redirect.");
    }
  };

  const observer = new MutationObserver((mutations) => {
    const roots = mutations.flatMap((mutation) =>
      Array.from(mutation.addedNodes).filter((node): node is Element => node instanceof Element),
    );
    if (roots.length > 0) {
      scanForOverlayTraps(roots);
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("pointerdown", onPointerCapture, true);
  document.addEventListener("keydown", onPointerCapture, true);
  document.addEventListener("click", onClickCapture, true);
  document.addEventListener("auxclick", onClickCapture, true);
  document.addEventListener("submit", onSubmitCapture, true);
  scanForOverlayTraps([document.body]);

  return () => {
    if (scanTimeout !== null) {
      window.clearTimeout(scanTimeout);
    }
    window.cancelAnimationFrame(scanFrame);
    window.open = nativeOpen as typeof window.open;
    try {
      if (originalAssignDescriptor) {
        Object.defineProperty(locationPrototype, "assign", originalAssignDescriptor);
      }
      if (originalReplaceDescriptor) {
        Object.defineProperty(locationPrototype, "replace", originalReplaceDescriptor);
      }
    } catch {
      // Ignore restore failures on locked browser objects.
    }
    observer.disconnect();
    document.removeEventListener("pointerdown", onPointerCapture, true);
    document.removeEventListener("keydown", onPointerCapture, true);
    document.removeEventListener("click", onClickCapture, true);
    document.removeEventListener("auxclick", onClickCapture, true);
    document.removeEventListener("submit", onSubmitCapture, true);
  };
}

export function useSafeBrowsing(options: SafeBrowsingOptions = {}) {
  useEffect(
    () => installSafeBrowsing(options),
    [options.enabled, options.safeMode, options.strictness, options.whitelist, options.onBlock],
  );
}
