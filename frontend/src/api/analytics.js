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
    throw new Error(data?.detail || "Ошибка запроса аналитики");
  }

  return data;
}

export async function trackVisit(payload) {
  return request("/api/analytics/track", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAnalyticsSummary(params = {}) {
  const searchParams = new URLSearchParams();

  searchParams.set("period", params.period || "7d");

  if (params.date_from) {
    searchParams.set("date_from", params.date_from);
  }

  if (params.date_to) {
    searchParams.set("date_to", params.date_to);
  }

  return request(`/api/analytics/summary?${searchParams.toString()}`, {
    auth: true
  });
}