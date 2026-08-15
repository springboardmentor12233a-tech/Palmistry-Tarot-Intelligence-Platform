import {
  API_BASE_URL,
} from "./api";


// ============================================================
// AUTH STORAGE
// ============================================================

const TOKEN_KEY =
  "palmistry_tarot_access_token";

const USER_KEY =
  "palmistry_tarot_user";


// ============================================================
// URL
// ============================================================

function buildApiUrl(
  path
) {
  const base =
    String(
      API_BASE_URL
    ).replace(
      /\/+$/,
      ""
    );

  const cleanPath =
    String(
      path
    ).replace(
      /^\/+/,
      ""
    );

  return (
    `${base}/${cleanPath}`
  );
}


// ============================================================
// AUTHENTICATED JSON REQUEST
// ============================================================

async function requestJson(
  path,
  options = {}
) {
  const token =
    localStorage.getItem(
      TOKEN_KEY
    );


  const response =
    await fetch(
      buildApiUrl(
        path
      ),
      {
        ...options,

        headers: {
          Accept:
            "application/json",

          ...(options.body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),

          ...(options.headers || {}),
        },
      }
    );


  const rawText =
    await response.text();


  let data = null;


  if (rawText) {
    try {

      data = JSON.parse(
        rawText
      );

    } catch {

      data = {
        message:
          rawText,
      };

    }
  }


  // =========================================================
  // SUCCESS
  // =========================================================

  if (response.ok) {

    return data;

  }


  // =========================================================
  // AUTHENTICATION EXPIRED
  // =========================================================

  if (
    response.status === 401
  ) {

    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );


    throw new Error(
      "Your login session has expired. Please sign in again."
    );
  }


  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const errorMessage =
    data?.detail ||
    data?.message ||
    `Request failed with status ${response.status}.`;


  throw new Error(
    errorMessage
  );
}


// ============================================================
// SEND PERSISTENT FOLLOW-UP
// ============================================================

export async function sendPersistentFollowUp(
  sessionId,
  message
) {
  return requestJson(
    "/api/chat/follow-up",
    {
      method: "POST",

      body: JSON.stringify({
        session_id:
          Number(
            sessionId
          ),

        message:
          String(
            message
          ).trim(),
      }),
    }
  );
}


// ============================================================
// GET SAVED READING SESSION
// ============================================================

export async function getReadingSession(
  sessionId
) {
  return requestJson(
    `/api/readings/sessions/${Number(sessionId)}`,
    {
      method: "GET",
    }
  );
}


// ============================================================
// GET SAVED READING SESSIONS
// ============================================================

export async function getReadingSessions(
  limit = 20
) {
  return requestJson(
    `/api/readings/sessions?limit=${Number(limit)}`,
    {
      method: "GET",
    }
  );
}