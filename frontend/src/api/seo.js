const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("admin_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (options.auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Ошибка запроса");
  }

  return data;
}

export async function getSeoPages() {
  return request("/api/settings/seo/pages", {
    auth: true
  });
}

export async function createSeoPage(payload) {
  return request("/api/settings/seo/pages", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload)
  });
}

export async function updateSeoPage(pageId, payload) {
  return request(`/api/settings/seo/pages/${pageId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload)
  });
}

export async function deleteSeoPage(pageId) {
  return request(`/api/settings/seo/pages/${pageId}`, {
    method: "DELETE",
    auth: true
  });
}

export async function getSeoCheck(pageId) {
  return request(`/api/settings/seo/check/${pageId}`, {
    auth: true
  });
}

export async function getSeoGlobalSettings() {
  return request("/api/settings/seo/global", {
    auth: true
  });
}

export async function updateSeoGlobalSettings(payload) {
  return request("/api/settings/seo/global", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload)
  });
}

export async function getSeoByPath(pathname) {
  const searchParams = new URLSearchParams({
    path: pathname || "/"
  });

  return request(`/api/settings/seo/by-path?${searchParams.toString()}`);
}

// Совместимость со старой формой, если где-то ещё используется
export async function getSeoSettings() {
  return request("/api/settings/seo", {
    auth: true
  });
}

export async function updateSeoSettings(payload) {
  return request("/api/settings/seo", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload)
  });
}