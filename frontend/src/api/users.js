import { API_URL } from "./config";

function getAuthHeaders() {
  const token = localStorage.getItem("admin_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

async function getErrorMessage(response, fallbackMessage) {
  try {
    const error = await response.json();

    if (typeof error.detail === "string") {
      return error.detail;
    }

    if (Array.isArray(error.detail)) {
      return error.detail
        .map((item) => item.msg || "Ошибка валидации")
        .join(", ");
    }

    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getUsers() {
  const response = await fetch(`${API_URL}/users/`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error("Не удалось получить пользователей");
  }

  return await response.json();
}

export async function createUser(data) {
  const response = await fetch(`${API_URL}/users/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Не удалось создать пользователя"
    );

    throw new Error(message);
  }

  return await response.json();
}

export async function updateUser(userId, data) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Не удалось обновить пользователя"
    );

    throw new Error(message);
  }

  return await response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Не удалось удалить пользователя"
    );

    throw new Error(message);
  }

  return await response.json();
}