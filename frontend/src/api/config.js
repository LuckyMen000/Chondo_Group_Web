const configuredApiUrl = (process.env.REACT_APP_API_URL || "").trim();

function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);
}

function isProductionBrowser() {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "production";
  }

  return !["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function getDefaultApiUrl() {
  if (typeof window !== "undefined" && isProductionBrowser()) {
    return `${window.location.origin}/api`;
  }

  return "http://localhost:8000/api";
}

export const API_URL = (
  configuredApiUrl && !(isProductionBrowser() && isLocalUrl(configuredApiUrl))
    ? configuredApiUrl
    : getDefaultApiUrl()
).replace(/\/$/, "");

export const API_ROOT_URL = API_URL.replace(/\/api$/, "");
