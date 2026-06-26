const defaultApiBaseUrl = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : (typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");

export const BASE_API_URL = process.env.REACT_APP_BASE_API_URL || defaultApiBaseUrl;
export const TOKEN = 'token';
export const ADMIN_TOKEN = 'adminToken';
