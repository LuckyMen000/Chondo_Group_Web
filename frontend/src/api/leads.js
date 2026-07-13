const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";


export async function createLead(data) {
  const response = await fetch(`${API_URL}/leads/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Ошибка при отправке заявки");
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