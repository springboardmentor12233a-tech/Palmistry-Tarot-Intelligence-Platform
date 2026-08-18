const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


// ======================================================
// COMMON RESPONSE HANDLER
// ======================================================

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = "Something went wrong.";

    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail
        .map((error) => {
          if (typeof error === "string") {
            return error;
          }

          if (error?.msg) {
            return error.msg;
          }

          return JSON.stringify(error);
        })
        .join(", ");
    } else if (typeof data.message === "string") {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
}


// ======================================================
// HEALTH
// ======================================================

export async function getHealthStatus() {
  const response = await fetch(
    `${API_BASE_URL}/health`
  );

  return parseResponse(response);
}


// ======================================================
// AUTH - REGISTER
// ======================================================

export async function registerUser(
  name,
  email,
  password
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  return parseResponse(response);
}


// ======================================================
// AUTH - LOGIN
// ======================================================

export async function loginUser(
  email,
  password
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return parseResponse(response);
}


// ======================================================
// AUTH - CURRENT USER
// ======================================================

export async function getCurrentUser() {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}


// ======================================================
// SAVE AUTH DATA
// ======================================================

export function saveAuthData(authResponse) {
  localStorage.setItem(
    "access_token",
    authResponse.access_token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(authResponse.user)
  );
}


// ======================================================
// GET SAVED USER
// ======================================================

export function getSavedUser() {
  const user =
    localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}


// ======================================================
// LOGOUT
// ======================================================

export function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}


// ======================================================
// TAROT - CREATE READING
// ======================================================

export async function createTarotReading(
  question,
  topic
) {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/tarot/reading`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        question,
        topic,
      }),
    }
  );

  return parseResponse(response);
}


// ======================================================
// TAROT - GET MY READINGS
// ======================================================

export async function getMyTarotReadings() {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/tarot/readings`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}


// ======================================================
// PALMISTRY - ANALYZE PALM
// ======================================================

export async function analyzePalm(
  imageFile
) {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  if (!imageFile) {
    throw new Error(
      "Please select a palm image."
    );
  }

  const formData = new FormData();

  formData.append(
    "image",
    imageFile
  );

  const response = await fetch(
    `${API_BASE_URL}/api/palmistry/analyze`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  return parseResponse(response);
}


// ======================================================
// PALMISTRY - GET MY READINGS
// ======================================================

export async function getMyPalmReadings() {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/palmistry/readings`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}


// ======================================================
// DASHBOARD - GET MY STATISTICS
// ======================================================

export async function getDashboardStats() {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/stats`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}


// ======================================================
// REPORTS - GET MY REPORT HISTORY
// ======================================================

export async function getReportHistory() {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/reports/history`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}


// ======================================================
// REPORTS - DOWNLOAD PDF HELPER
// ======================================================

async function downloadReportPdf(
  endpoint,
  filename
) {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(() => ({}));

    throw new Error(
      data.detail ||
      data.message ||
      "Unable to download report."
    );
  }

  const blob =
    await response.blob();

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    url
  );
}


// ======================================================
// REPORTS - PALMISTRY PDF
// ======================================================

export async function downloadPalmistryReport(
  readingId
) {
  if (!readingId) {
    throw new Error(
      "Palmistry reading ID is required."
    );
  }

  return downloadReportPdf(
    `/api/reports/palmistry/${readingId}/pdf`,
    `palmistry_report_${readingId}.pdf`
  );
}


// ======================================================
// REPORTS - TAROT PDF
// ======================================================

export async function downloadTarotReport(
  readingId
) {
  if (!readingId) {
    throw new Error(
      "Tarot reading ID is required."
    );
  }

  return downloadReportPdf(
    `/api/reports/tarot/${readingId}/pdf`,
    `tarot_report_${readingId}.pdf`
  );
}


// ======================================================
// REPORTS - COMBINED PDF
// ======================================================

export async function downloadCombinedReport(
  palmReadingId,
  tarotReadingId
) {
  if (!palmReadingId) {
    throw new Error(
      "Palmistry reading ID is required."
    );
  }

  if (!tarotReadingId) {
    throw new Error(
      "Tarot reading ID is required."
    );
  }

  return downloadReportPdf(
    `/api/reports/combined/${palmReadingId}/${tarotReadingId}/pdf`,
    `combined_report_${palmReadingId}_${tarotReadingId}.pdf`
  );
}

// ======================================================
// AI INSIGHTS
// ======================================================

export async function getPersonalizedInsights() {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/insights`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}

// ======================================================
// ADMIN - UPDATE USER STATUS
// ======================================================

export async function updateUserStatus(
  userId,
  isActive
) {
  const token =
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  if (!userId) {
    throw new Error("User ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        is_active: isActive,
      }),
    }
  );

  return parseResponse(response);
}

// ======================================================
// AUTH - FORGOT PASSWORD
// ======================================================

export async function forgotPassword(email) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to process password reset request."
    );
  }

  return data;
}


// ======================================================
// AUTH - RESET PASSWORD
// ======================================================

export async function resetPassword(
  token,
  newPassword
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to reset password."
    );
  }

  return data;

}
