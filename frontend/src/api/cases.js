const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";


export async function getCases() {
  const response = await fetch(`${API_URL}/cases/`);

  if (!response.ok) {
    throw new Error("Ошибка при получении кейсов");
  }

  return await response.json();
}


export async function getAdminCases(token) {
  const response = await fetch(`${API_URL}/cases/admin`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при получении кейсов");
  }

  return await response.json();
}


export async function createCase(token, data) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("subtitle", data.subtitle || "");
  formData.append("description", data.description || "");
  formData.append("category", data.category || "development");
  formData.append("logo_text", data.logo_text || "");
  formData.append("accent", data.accent || "#111111");
  formData.append("is_active", data.is_active ? "true" : "false");

  if (
    data.sort_order !== undefined &&
    data.sort_order !== null &&
    data.sort_order !== ""
  ) {
    formData.append("sort_order", data.sort_order);
  }

  if (data.file) {
    formData.append("file", data.file);
  }

  const response = await fetch(`${API_URL}/cases/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при создании кейса");
  }

  return await response.json();
}


export async function updateCase(token, caseId, data) {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при обновлении кейса");
  }

  return await response.json();
}


export async function replaceCaseImage(token, caseId, file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/cases/${caseId}/image`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при замене изображения кейса");
  }

  return await response.json();
}


export async function deleteCase(token, caseId) {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при удалении кейса");
  }

  return await response.json();
}