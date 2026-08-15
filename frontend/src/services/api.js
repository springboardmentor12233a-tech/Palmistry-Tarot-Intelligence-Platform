// ============================================================
// API CONFIGURATION
// ============================================================

// Render / production:
// VITE_API_BASE_URL=https://palmistry-tarot-intelligence-platform.onrender.com
//
// Local development fallback:
// http://127.0.0.1:8000

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");


// ============================================================
// AUTHENTICATION
// ============================================================

const AUTH_TOKEN_KEY =
  "palmistry_tarot_access_token";


function getAuthToken() {
  return localStorage.getItem(
    AUTH_TOKEN_KEY
  );
}

// ============================================================
// URL HELPERS
// ============================================================

export function buildBackendUrl(path = "") {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}


// ============================================================
// ERROR HELPERS
// ============================================================

function extractErrorMessage(
  responseData,
  fallbackMessage = "The request could not be completed."
) {
  if (!responseData) {
    return fallbackMessage;
  }

  // New global backend error format
  if (
    typeof responseData.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  // Traditional FastAPI detail string
  if (
    typeof responseData.detail === "string" &&
    responseData.detail.trim()
  ) {
    return responseData.detail;
  }

  // FastAPI validation details
  if (Array.isArray(responseData.detail)) {
    return responseData.detail
      .map((item) => {
        const location = Array.isArray(item?.loc)
          ? item.loc.join(" → ")
          : "request";

        const message =
          item?.msg ||
          "Invalid request data.";

        return `${location}: ${message}`;
      })
      .join(" | ");
  }

  // New validation handler format
  if (Array.isArray(responseData.errors)) {
    return responseData.errors
      .map((item) => {
        const location = Array.isArray(item?.loc)
          ? item.loc.join(" → ")
          : "request";

        const message =
          item?.msg ||
          "Invalid request data.";

        return `${location}: ${message}`;
      })
      .join(" | ");
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


function createNetworkError(endpoint) {
  return new Error(
    `Could not connect to the backend at ${API_BASE_URL}. ` +
      `The service may be starting or temporarily unavailable. ` +
      `Request: ${endpoint}`
  );
}


// ============================================================
// GENERIC JSON REQUESTS
// ============================================================

async function requestJson(
  endpoint,
  {
    method = "GET",
    body = undefined,
    headers = {},
  } = {}
) {
  let response;

  const token =
    getAuthToken();
  try {
    response = await fetch(
      buildBackendUrl(endpoint),
      {
        method,
        headers: {
  Accept:
    "application/json",

  ...(token
    ? {
        Authorization:
          `Bearer ${token}`,
      }
    : {}),

  ...headers,
},
        body,
      }
    );
  } catch (error) {
    console.error(
      `Backend connection error for ${endpoint}:`,
      error
    );

    throw createNetworkError(endpoint);
  }

  const responseData =
    await readJsonResponse(response);

  if (!response.ok) {
    const fallback =
      `Request failed with status ${response.status}.`;

    const message =
      extractErrorMessage(
        responseData,
        fallback
      );

    if (response.status === 400) {
      throw new Error(
        message ||
          "The submitted request is invalid."
      );
    }

    if (response.status === 413) {
      throw new Error(
        message ||
          "The uploaded file is too large."
      );
    }

    if (response.status === 415) {
      throw new Error(
        message ||
          "The uploaded file type is not supported."
      );
    }

    if (response.status === 422) {
      throw new Error(
        message ||
          "Some submitted information is invalid or incomplete."
      );
    }

    if (response.status === 429) {
      throw new Error(
        message ||
          "The AI service usage limit has been reached. Please wait and try again."
      );
    }

    if (response.status === 503) {
      throw new Error(
        message ||
          "The AI service is temporarily unavailable. Please try again shortly."
      );
    }

    if (response.status >= 500) {
      throw new Error(
        message ||
          "The backend could not complete the request."
      );
    }

    throw new Error(message);
  }

  if (!responseData) {
    throw new Error(
      "The backend returned an empty or invalid response."
    );
  }

  return responseData;
}


async function getJson(endpoint) {
  return requestJson(endpoint);
}


async function postJson(
  endpoint,
  payload
) {
  return requestJson(
    endpoint,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(payload),
    }
  );
}


// ============================================================
// COMPLETE READING
// ============================================================

export async function generateCompleteReading(
  readingData
) {
  return postJson(
    "/api/readings/generate-complete",
    readingData
  );
}


// ============================================================
// TAROT
// ============================================================

export async function drawTarotCards(
  spread
) {
  if (
    !spread ||
    typeof spread !== "string"
  ) {
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


// ============================================================
// INDIVIDUAL AI MODULES
// ============================================================

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


// ============================================================
// GUIDANCE SCORING
// ============================================================

export async function calculateGuidanceScores(
  scoreData
) {
  return postJson(
    "/api/scores/calculate",
    scoreData
  );
}


// ============================================================
// BACKEND STATUS
// ============================================================

export async function checkBackendHealth() {
  return getJson(
    "/api/health"
  );
}


export async function getApiInformation() {
  return getJson("/");
}


// ============================================================
// PALM IMAGE ANALYSIS
// ============================================================

export async function analyzePalmImage(
  file
) {
  if (!file) {
    throw new Error(
      "Please select a palm image."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  let response;

  try {
    response = await fetch(
      buildBackendUrl(
        "/api/palm/analyze"
      ),
      {
        method: "POST",
        body: formData,
      }
    );
  } catch (error) {
    console.error(
      "Palm backend connection error:",
      error
    );

    throw createNetworkError(
      "/api/palm/analyze"
    );
  }

  const responseData =
    await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(
        responseData,
        "Palm image analysis failed."
      )
    );
  }

  if (!responseData) {
    throw new Error(
      "The palm-analysis service returned an invalid response."
    );
  }

  return responseData;
}


// ============================================================
// ANALYTICS
// ============================================================

export async function getAnalyticsSummary() {
  return getJson(
    "/api/analytics/summary"
  );
}


export async function getReadingHistory(
  limit = 10
) {
  const safeLimit =
    Math.max(
      1,
      Math.min(
        Number(limit) || 10,
        1000
      )
    );

  return getJson(
    `/api/analytics/history?limit=${safeLimit}`
  );
}


// ============================================================
// FILE DOWNLOAD HELPERS
// ============================================================

function getDownloadFilename(
  response,
  fallbackFilename
) {
  const disposition =
    response.headers.get(
      "Content-Disposition"
    );

  if (!disposition) {
    return fallbackFilename;
  }

  const utfMatch =
    disposition.match(
      /filename\*=UTF-8''([^;]+)/
    );

  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(
        utfMatch[1]
      );
    } catch {
      return utfMatch[1];
    }
  }

  const normalMatch =
    disposition.match(
      /filename="?([^";]+)"?/
    );

  return (
    normalMatch?.[1] ||
    fallbackFilename
  );
}


async function downloadResponseFile(
  response,
  fallbackFilename
) {
  if (!response.ok) {
    const responseData =
      await readJsonResponse(
        response
      );

    throw new Error(
      extractErrorMessage(
        responseData,
        "File download failed."
      )
    );
  }

  const blob =
    await response.blob();

  const fileUrl =
    URL.createObjectURL(blob);

  const filename =
    getDownloadFilename(
      response,
      fallbackFilename
    );

  const link =
    document.createElement("a");

  link.href = fileUrl;
  link.download = filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    fileUrl
  );
}


// ============================================================
// PDF REPORT
// ============================================================

export async function downloadReadingPdf(
  readingRequest,
  readingResponse
) {
  let response;

  try {
    response = await fetch(
      buildBackendUrl(
        "/api/reports/reading-pdf"
      ),
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          reading_request:
            readingRequest,

          reading_response:
            readingResponse,
        }),
      }
    );
  } catch (error) {
    console.error(
      "PDF backend connection error:",
      error
    );

    throw createNetworkError(
      "/api/reports/reading-pdf"
    );
  }

  await downloadResponseFile(
    response,
    "palmistry_tarot_reading.pdf"
  );
}


// ============================================================
// ANALYTICS CSV EXPORT
// ============================================================

export async function downloadAnalyticsSummaryCsv() {
  let response;

  try {
    response = await fetch(
      buildBackendUrl(
        "/api/reports/analytics-summary.csv"
      )
    );
  } catch (error) {
    console.error(
      "Analytics CSV connection error:",
      error
    );

    throw createNetworkError(
      "/api/reports/analytics-summary.csv"
    );
  }

  await downloadResponseFile(
    response,
    "analytics_summary.csv"
  );
}


export async function downloadReadingHistoryCsv(
  limit = 100
) {
  const safeLimit =
    Math.max(
      1,
      Math.min(
        Number(limit) || 100,
        1000
      )
    );

  let response;

  try {
    response = await fetch(
      buildBackendUrl(
        `/api/reports/reading-history.csv?limit=${safeLimit}`
      )
    );
  } catch (error) {
    console.error(
      "History CSV connection error:",
      error
    );

    throw createNetworkError(
      "/api/reports/reading-history.csv"
    );
  }

  await downloadResponseFile(
    response,
    "reading_history.csv"
  );
}

// ============================================================
// READING FOLLOW-UP CHAT
// ============================================================

export async function sendFollowUpChat(
  chatData
) {
  return postJson(
    "/api/chat/follow-up",
    chatData
  );
}