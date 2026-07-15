import { API_URL } from "./config";

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || fallbackMessage);
  }

  return data;
}

export async function getPublicFooterSettings({ signal } = {}) {
  const response = await fetch(`${API_URL}/footer/public`, {
    signal,
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  return parseResponse(response, "Не удалось загрузить ссылки футера");
}

export async function getAdminFooterSettings(token) {
  const response = await fetch(`${API_URL}/footer/admin`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseResponse(response, "Не удалось загрузить настройки футера");
}

export async function updateAdminFooterSettings(token, payload) {
  const response = await fetch(`${API_URL}/footer/admin`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response, "Не удалось сохранить настройки футера");
}
