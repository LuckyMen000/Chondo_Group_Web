import { API_URL } from "./config";


export async function createLead(data) {
  const response = await fetch(`${API_URL}/leads/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Ошибка при отправке заявки");
  }

  return await response.json();
}


export async function getLeads(token) {
  const response = await fetch(`${API_URL}/leads/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Ошибка при получении заявок");
  }

  return await response.json();
}