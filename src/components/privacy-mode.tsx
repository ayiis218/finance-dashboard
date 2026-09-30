"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const STORAGE_KEY = "finance-dashboard:privacy-mode";
const SYNC_EVENT = "privacy-mode-sync";

/**
 * Preferensi per-browser (bukan per-user/DB) — tepat buat localStorage, tidak
 * perlu disinkronkan lintas device. `useSyncExternalStore` dipakai (bukan
 * state+effect) supaya bridging ke localStorage ini benar secara SSR: server
 * & render pertama client selalu sepakat `false` (`getServerSnapshot`), dan
 * nilai sungguhan cuma pernah dibaca di client (`getSnapshot`) — tanpa celah
 * hydration-mismatch maupun setState-di-effect.
 */
function subscribe(callback: () => void) {
  window.addEventListener(SYNC_EVENT, callback);
  return () => window.removeEventListener(SYNC_EVENT, callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

function setStoredHidden(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Gagal simpan preferensi tidak boleh menggagalkan toggle-nya sendiri.
  }
  // `storage` bawaan browser cuma fire di tab LAIN, bukan tab yang menulis —
  // event custom ini yang bikin useSyncExternalStore re-check di tab sendiri.
  window.dispatchEvent(new Event(SYNC_EVENT));
}

const PrivacyModeContext = createContext<{ hidden: boolean; toggle: () => void }>({
  hidden: false,
  toggle: () => {},
});

export function PrivacyModeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const hidden = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = () => setStoredHidden(!hidden);

  return (
    <PrivacyModeContext.Provider value={{ hidden, toggle }}>{children}</PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode() {
  return useContext(PrivacyModeContext);
}
