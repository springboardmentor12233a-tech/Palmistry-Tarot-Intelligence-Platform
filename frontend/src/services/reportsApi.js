import {
  buildBackendUrl,
  downloadReadingPdf,
} from "./api";


// ============================================================
// AUTH
// ============================================================

const AUTH_TOKEN_KEY =
  "palmistry_tarot_access_token";


function getAuthToken() {

  return localStorage.getItem(
    AUTH_TOKEN_KEY
  );
}


// ============================================================
// ERROR HELPER
// ============================================================

async function getDownloadError(
  response,
  fallbackMessage
) {

  try {

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {

      const data =
        await response.json();


      return (
        data?.message ||
        data?.detail ||
        fallbackMessage
      );

    }

  } catch {

    // Ignore parsing failure.

  }


  return fallbackMessage;
}


// ============================================================
// DOWNLOAD HELPER
// ============================================================

async function downloadFile(
  endpoint,
  fallbackFilename
) {

  const token =
    getAuthToken();


  if (!token) {

    throw new Error(
      "Your login session is unavailable. Please log in again."
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
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


  } catch (error) {

    console.error(
      "REPORT DOWNLOAD CONNECTION ERROR:",
      error
    );


    throw new Error(
      "Could not connect to the backend."
    );

  }


  if (!response.ok) {

    throw new Error(
      await getDownloadError(
        response,
        "The report could not be downloaded."
      )
    );

  }


  const blob =
    await response.blob();


  const fileUrl =
    URL.createObjectURL(
      blob
    );


  const disposition =
    response.headers.get(
      "Content-Disposition"
    );


  let filename =
    fallbackFilename;


  if (disposition) {

    const match =
      disposition.match(
        /filename="?([^";]+)"?/
      );


    if (match?.[1]) {

      filename =
        match[1];

    }

  }


  const link =
    document.createElement(
      "a"
    );


  link.href =
    fileUrl;


  link.download =
    filename;


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
// USER ANALYTICS CSV
// ============================================================

export async function downloadMyAnalyticsCsv() {

  return downloadFile(
    "/api/reports/analytics-summary.csv",
    "my_analytics_summary.csv"
  );
}


// ============================================================
// USER READING HISTORY CSV
// ============================================================

export async function downloadMyReadingHistoryCsv(
  limit = 100
) {

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Number(limit) || 100,
        100
      )
    );


  return downloadFile(
    `/api/reports/reading-history.csv?limit=${safeLimit}`,
    "my_reading_history.csv"
  );
}


// ============================================================
// SAVED READING PDF
// ============================================================

export async function downloadSavedReadingPdf(
  session
) {

  if (!session) {

    throw new Error(
      "Please select a saved reading first."
    );

  }


  const readingRequest = {

    user_profile:
      session.user_profile ||
      {},


    reading_context:
      session.reading_context ||
      {},


    palm_analysis:
      session.palm_analysis ||
      {},


    tarot_analysis:
      session.tarot_analysis ||
      {},

  };


  const readingResponse = {

    status:
      "success",


    message:
      "Saved reading report",


    reading:
      session.initial_reading ||
      {},


    scores:
      session.scores ||
      {},


    reading_session_id:
      session.id,

  };


  return downloadReadingPdf(
    readingRequest,
    readingResponse
  );
}