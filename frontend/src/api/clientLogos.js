import { API_URL } from "./config";


export async function getClientLogos() {
  const response = await fetch(`${API_URL}/client-logos/`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  if (!response.ok) {
    throw new Error("Ошибка при получении логотипов");
  }

  return await response.json();
}


export async function getAdminClientLogos(token) {
  const response = await fetch(`${API_URL}/client-logos/admin`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Ошибка при получении логотипов");
  }

  return await response.json();
}


export async function uploadClientLogo(token, data) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("file", data.file);

  if (
    data.sort_order !== undefined &&
    data.sort_order !== null &&
    data.sort_order !== ""
  ) {
    formData.append("sort_order", data.sort_order);
  }

  const response = await fetch(`${API_URL}/client-logos/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при загрузке логотипа");
  }

  return await response.json();
}


export async function updateClientLogo(token, logoId, data) {
  const response = await fetch(`${API_URL}/client-logos/${logoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при обновлении логотипа");
  }

  return await response.json();
}


export async function replaceClientLogoImage(token, logoId, file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/client-logos/${logoId}/image`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при замене логотипа");
  }

  return await response.json();
}


export async function deleteClientLogo(token, logoId) {
  const response = await fetch(`${API_URL}/client-logos/${logoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при удалении логотипа");
  }

  return await response.json();
}