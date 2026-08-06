const API_BASE_URL = "http://127.0.0.1:8000";

export async function generateInterpretation(readingData) {
  const response = await fetch(
    `${API_BASE_URL}/api/interpretation/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(readingData),
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.detail || "AI interpretation generation failed."
    );
  }

  return responseData;
}