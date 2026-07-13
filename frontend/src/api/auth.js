const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";


export async function loginUser(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Неверная почта или пароль");
  }

  return await response.json();
}


export async function getMe(token) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Пользователь не авторизован");
  }

  return await response.json();
}