import {
  buildBackendUrl,
} from "./api";


// ============================================================
// AUTH
// ============================================================

const TOKEN_KEY =
  "palmistry_tarot_access_token";


function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );
}


// ============================================================
// ERROR HELPER
// ============================================================

function getErrorMessage(
  data,
  fallback
) {

  if (
    typeof data?.message ===
    "string"
  ) {

    return data.message;

  }


  if (
    typeof data?.detail ===
    "string"
  ) {

    return data.detail;

  }


  return fallback;
}


// ============================================================
// REQUEST
// ============================================================

async function consultantRequest(
  endpoint
) {

  const token =
    getToken();


  if (!token) {

    throw new Error(
      "Authentication is required."
    );

  }


  let response;


  try {

    response =
      await fetch(
        buildBackendUrl(
          endpoint
        ),
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
        }
      );


  } catch (error) {

    console.error(
      "Spiritual Consultant API network error:",
      error
    );


    throw new Error(
      "Could not connect to the backend."
    );

  }


  let data =
    null;


  try {

    data =
      await response.json();

  } catch {

    data =
      null;

  }


  if (!response.ok) {

    if (
      response.status ===
      403
    ) {

      throw new Error(
        "You do not have permission to access the Spiritual Consultant Dashboard."
      );

    }


    throw new Error(
      getErrorMessage(
        data,
        `Request failed (${response.status}).`
      )
    );

  }


  return data;
}


// ============================================================
// SUMMARY
// ============================================================

export async function getConsultantAnalyticsSummary() {

  return consultantRequest(
    "/api/spiritual-consultant/analytics/summary"
  );
}


// ============================================================
// HISTORY
// ============================================================

export async function getConsultantReadingHistory(
  limit = 50
) {

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Number(limit) || 50,
        100
      )
    );


  return consultantRequest(
    `/api/spiritual-consultant/analytics/history?limit=${safeLimit}`
  );
}