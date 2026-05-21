// Barrel export for all services.
//
// When the backend is ready:
// 1. Create HTTP implementations (e.g., productService.http.ts)
// 2. Set VITE_USE_LOCAL_SERVICES=false in .env
// 3. Update the exports below to point to HTTP implementations.
//
// No page or context code needs to change — only this file.

import { ENV } from "@/config/env";

// Local (localStorage-backed) implementations
import * as localStoreService from "./storeService";
import * as localProcurementService from "./procurementService";
import * as localWorkspaceService from "./workspaceService";

export const useLocal = ENV.USE_LOCAL_SERVICES;

// Re-export based on environment.
// For now, both local and "remote" point to the same local implementations.
// When backend is ready, add HTTP service modules and toggle below.

export const authService = localStoreService;
export const productService = localStoreService;
export const posService = localStoreService;
export const shiftService = localStoreService;
export const settingsService = localStoreService;
export const procurementService = localProcurementService;
export const workspaceService = localWorkspaceService;
