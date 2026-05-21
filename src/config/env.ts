export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  USE_LOCAL_SERVICES: import.meta.env.VITE_USE_LOCAL_SERVICES !== "false",
  APP_NAME: import.meta.env.VITE_APP_NAME || "ERP Prototype",
} as const;
