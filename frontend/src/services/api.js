const API_BASE_URL = "http://127.0.0.1:8000";

async function postJson(endpoint, payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      "Could not connect to the backend. Make sure FastAPI is running on port 8000."
    );
  }

  let responseData;

  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    const backendMessage =
      typeof responseData?.detail === "string"
        ? responseData.detail
        : null;

    if (response.status === 503) {
      throw new Error(
        backendMessage ||
          "Gemini is temporarily busy. Please wait a moment and try again."
      );
    }

    if (response.status === 422) {
      throw new Error(
        backendMessage ||
          "Some form data is invalid or incomplete."
      );
    }

    throw new Error(
      backendMessage ||
        `Request failed with status ${response.status}.`
    );
  }

  if (!responseData) {
    throw new Error("The backend returned an empty response.");
  }

  return responseData;
}

export async function generateInterpretation(readingData) {
  return postJson(
    "/api/interpretation/generate",
    readingData
  );
}

export async function generatePersonality(readingData) {
  return postJson(
    "/api/personality/generate",
    readingData
  );
}