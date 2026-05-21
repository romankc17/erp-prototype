import { z } from "zod";
import type { AppState } from "./types";

const STORAGE_KEY = "erp_pos_state_v1";

const appStateSchema = z.object({
  version: z.literal(1),
}).passthrough();

export function loadAppState(fallback: AppState): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const ok = appStateSchema.safeParse(parsed);
    if (!ok.success) return fallback;
    return parsed as AppState;
  } catch {
    return fallback;
  }
}

export function saveAppState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAppState() {
  localStorage.removeItem(STORAGE_KEY);
}
