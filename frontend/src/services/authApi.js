import {
  API_BASE_URL,
  buildBackendUrl,
} from "./api";


const TOKEN_KEY =
  "palmistry_tarot_access_token";

const USER_KEY =
  "palmistry_tarot_user";


// ============================================================
// LOCAL AUTH STORAGE
// ============================================================

export function getStoredToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );
}


export function getStoredUser() {

  const value =
    localStorage.getItem(
      USER_KEY
    );


  if (!value) {
    return null;
  }


  try {

    return JSON.parse(
      value
    );

  } catch {

    return null;

  }
}


export function storeAuthSession(
  accessToken,
  user
) {

  localStorage.setItem(
    TOKEN_KEY,
    accessToken
  );


  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      user
    )
  );
}


export function clearAuthSession() {

  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}


// ============================================================
// RESPONSE HELPERS
// ============================================================

async function readJson(
  response
) {

  try {

    return await response.json();

  } catch {

    return null;

  }
}


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


  if (
    Array.isArray(
      data?.errors
    )
  ) {

    return data.errors
      .map(
        (item) =>
          item?.msg ||
          "Invalid information."
      )
      .join(" | ");

  }


  return fallback;
}


// ============================================================
// GENERIC AUTH REQUEST
// ============================================================

async function authRequest(
  endpoint,
  {
    method = "GET",
    body,
    authenticated = false,
  } = {}
) {

  const headers = {

    Accept:
      "application/json",

  };


  if (
    body !== undefined
  ) {

    headers[
      "Content-Type"
    ] =
      "application/json";

  }


  if (
    authenticated
  ) {

    const token =
      getStoredToken();


    if (!token) {

      throw new Error(
        "Authentication is required."
      );

    }


    headers.Authorization =
      `Bearer ${token}`;

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

          headers,

          body:
            body !== undefined
              ? JSON.stringify(
                  body
                )
              : undefined,

        }
      );

  } catch (error) {

    console.error(
      "Authentication network error:",
      error
    );


    throw new Error(
      `Could not connect to ${API_BASE_URL}.`
    );

  }


  const data =
    await readJson(
      response
    );


  if (!response.ok) {

    throw new Error(
      getErrorMessage(
        data,
        `Authentication request failed (${response.status}).`
      )
    );

  }


  return data;
}


// ============================================================
// PUBLIC AUTH
// ============================================================

export async function registerUser(
  registrationData
) {

  return authRequest(
    "/api/auth/register",
    {

      method:
        "POST",

      body:
        registrationData,

    }
  );
}


export async function loginUser(
  email,
  password
) {

  return authRequest(
    "/api/auth/login",
    {

      method:
        "POST",

      body: {

        email,

        password,

      },

    }
  );
}


// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser() {

  return authRequest(
    "/api/auth/me",
    {

      authenticated:
        true,

    }
  );
}


export async function updateProfile(
  profile
) {

  return authRequest(
    "/api/auth/profile",
    {

      method:
        "PATCH",

      body:
        profile,

      authenticated:
        true,

    }
  );
}


// ============================================================
// ADMIN — USER OVERVIEW
// ============================================================

export async function getAdminOverview() {

  return authRequest(
    "/api/admin/overview",
    {

      authenticated:
        true,

    }
  );
}


// ============================================================
// ADMIN — USER MANAGEMENT
// ============================================================

export async function getAdminUsers() {

  return authRequest(
    "/api/admin/users",
    {

      authenticated:
        true,

    }
  );
}


export async function updateUserRole(
  userId,
  role
) {

  return authRequest(
    `/api/admin/users/${userId}/role`,
    {

      method:
        "PATCH",

      body: {

        role,

      },

      authenticated:
        true,

    }
  );
}


export async function updateUserStatus(
  userId,
  isActive
) {

  return authRequest(
    `/api/admin/users/${userId}/status`,
    {

      method:
        "PATCH",

      body: {

        is_active:
          isActive,

      },

      authenticated:
        true,

    }
  );
}


// ============================================================
// ADMIN — PLATFORM ANALYTICS
// ============================================================

export async function getAdminAnalyticsSummary() {

  return authRequest(
    "/api/admin/analytics/summary",
    {

      authenticated:
        true,

    }
  );
}


export async function getAdminReadingHistory(
  limit = 20
) {

  const safeLimit =
    Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 20
      )
    );


  return authRequest(
    `/api/admin/analytics/history?limit=${safeLimit}`,
    {

      authenticated:
        true,

    }
  );
}