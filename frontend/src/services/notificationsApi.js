import {
  buildBackendUrl,
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
// REQUEST HELPER
// ============================================================

async function notificationRequest(
  endpoint,
  {
    method = "GET",
  } = {}
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
          method,

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
      "NOTIFICATION CONNECTION ERROR:",
      error
    );


    throw new Error(
      "Could not connect to the backend."
    );

  }


  let responseData =
    null;


  try {

    responseData =
      await response.json();

  } catch {

    responseData =
      null;

  }


  if (!response.ok) {

    const message =

      responseData?.message ||

      responseData?.detail ||

      "The notification request failed.";


    throw new Error(
      typeof message === "string"
        ? message
        : "The notification request failed."
    );

  }


  return responseData;
}


// ============================================================
// LIST NOTIFICATIONS
// ============================================================

export async function getNotifications(
  {
    limit = 50,
    unreadOnly = false,
  } = {}
) {

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Number(limit) || 50,
        100
      )
    );


  return notificationRequest(
    (
      "/api/notifications"
      + `?limit=${safeLimit}`
      + `&unread_only=${Boolean(unreadOnly)}`
    )
  );
}


// ============================================================
// UNREAD COUNT
// ============================================================

export async function getUnreadNotificationCount() {

  return notificationRequest(
    "/api/notifications/unread-count"
  );
}


// ============================================================
// MARK ONE READ
// ============================================================

export async function markNotificationRead(
  notificationId
) {

  return notificationRequest(
    `/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    }
  );
}


// ============================================================
// MARK ALL READ
// ============================================================

export async function markAllNotificationsRead() {

  return notificationRequest(
    "/api/notifications/read-all",
    {
      method: "PATCH",
    }
  );
}