const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


function extractErrorMessage(responseData, fallbackMessage) {
  const detail = responseData?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const location = Array.isArray(item?.loc)
          ? item.loc.join(" → ")
          : "request";

        const message =
          item?.msg || "Invalid request data.";

        return `${location}: ${message}`;
      })
      .join(" | ");
  }

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  return fallbackMessage;
}


async function readJsonResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}


async function postJson(endpoint, payload) {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  } catch (error) {
    console.error(
      `Backend connection error for ${endpoint}:`,
      error
    );

    throw new Error(
      "Could not connect to the backend. Make sure FastAPI is running on port 8000."
    );
  }

  const responseData =
    await readJsonResponse(response);

  if (!response.ok) {
    const defaultMessage =
      `Request failed with status ${response.status}.`;

    const backendMessage = extractErrorMessage(
      responseData,
      defaultMessage
    );

    if (response.status === 422) {
      throw new Error(
        backendMessage ||
          "Some submitted information is invalid or incomplete."
      );
    }

    if (response.status === 429) {
      throw new Error(
        backendMessage ||
          "The Gemini usage limit has been reached. Please wait and try again."
      );
    }

    if (response.status === 503) {
      throw new Error(
        backendMessage ||
          "Gemini is temporarily busy or unavailable. Please wait and try again."
      );
    }

    if (response.status >= 500) {
      throw new Error(
        backendMessage ||
          "The backend could not complete the request."
      );
    }

    throw new Error(backendMessage);
  }

  if (!responseData) {
    throw new Error(
      "The backend returned an empty or invalid response."
    );
  }

  return responseData;
}


async function getJson(endpoint) {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      `Backend connection error for ${endpoint}:`,
      error
    );

    throw new Error(
      "Could not connect to the backend. Make sure FastAPI is running on port 8000."
    );
  }

  const responseData =
    await readJsonResponse(response);

  if (!response.ok) {
    const backendMessage = extractErrorMessage(
      responseData,
      `Request failed with status ${response.status}.`
    );

    throw new Error(backendMessage);
  }

  if (!responseData) {
    throw new Error(
      "The backend returned an empty or invalid response."
    );
  }

  return responseData;
}


/*
Complete reading workflow

This is the main endpoint used by the React application.
It returns interpretation, personality, recommendations,
life trends and guidance scores in one response.
*/

export async function generateCompleteReading(
  readingData
) {
  return postJson(
    "/api/readings/generate-complete",
    readingData
  );
}


/*
Automatic tarot drawing
*/

export async function drawTarotCards(spread) {
  if (!spread || typeof spread !== "string") {
    throw new Error(
      "Please select a valid tarot spread."
    );
  }

  return postJson(
    "/api/tarot/draw",
    {
      spread,
    }
  );
}


export async function getTarotDatasetSummary() {
  return getJson(
    "/api/tarot/dataset-summary"
  );
}


/*
Individual AI modules

These functions can still be used for separate testing,
Swagger comparison or future module pages.
*/

export async function generateInterpretation(
  readingData
) {
  return postJson(
    "/api/interpretation/generate",
    readingData
  );
}


export async function generatePersonality(
  readingData
) {
  return postJson(
    "/api/personality/generate",
    readingData
  );
}


export async function generateRecommendations(
  readingData
) {
  return postJson(
    "/api/recommendations/generate",
    readingData
  );
}


export async function generateLifeTrends(
  readingData
) {
  return postJson(
    "/api/trends/generate",
    readingData
  );
}


/*
Python-based guidance scoring
*/

export async function calculateGuidanceScores(
  scoreData
) {
  return postJson(
    "/api/scores/calculate",
    scoreData
  );
}


/*
Backend status checks
*/

export async function checkBackendHealth() {
  return getJson("/api/health");
}


export async function getApiInformation() {
  return getJson("/");
}

export async function analyzePalmImage(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    "http://127.0.0.1:8000/api/palm/analyze",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        "Palm image analysis failed."
    );
  }

  return data;
}