const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("arcana_access_token");
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("You must be logged in.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || "Request failed."
    );
  }

  return data;
}

export async function saveReading({
  readingType,
  title,
  question = "",
  result,
}) {
  return apiRequest("/api/history", {
    method: "POST",
    body: JSON.stringify({
      reading_type: readingType,
      title,
      question,
      result,
    }),
  });
}

export async function getHistory() {
  return apiRequest("/api/history");
}

export async function getReading(id) {
  return apiRequest(`/api/history/${id}`);
}

export async function deleteReading(id) {
  return apiRequest(`/api/history/${id}`, {
    method: "DELETE",
  });

}