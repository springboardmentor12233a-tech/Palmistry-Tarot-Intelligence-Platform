// ==========================================
// MYSTIC ORACLE • AUTHENTICATION & SESSIONS
// ==========================================

const AuthState = {
    user: null,
    token: null,

    async init() {
        const storedToken = localStorage.getItem("mystic_token");
        const storedUser = localStorage.getItem("mystic_user");

        if (storedToken && storedUser) {
            try {
                this.token = storedToken;
                this.user = JSON.parse(storedUser);
            } catch (e) {
                this.token = null;
                this.user = null;
            }
        }

        // Always re-verify the stored token against the server before trusting it.
        // This makes sure a cleared/expired/tampered session can never unlock the app.
        if (this.token) {
            const valid = await this.verifyToken();
            if (!valid) {
                this.token = null;
                this.user = null;
                localStorage.removeItem("mystic_token");
                localStorage.removeItem("mystic_user");
            }
        }

        this.updateUI();
        this.bindEvents();
    },

    async verifyToken() {
        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            if (!res.ok) return false;
            const data = await res.json();
            return !!(data && data.success);
        } catch (e) {
            return false;
        }
    },

    // Helper for other scripts making authenticated API calls
    authHeaders() {
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    },

    setUser(user, token) {
        this.user = user;
        this.token = token;
        localStorage.setItem("mystic_token", token);
        localStorage.setItem("mystic_user", JSON.stringify(user));
        this.updateUI();
    },

    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem("mystic_token");
        localStorage.removeItem("mystic_user");
        this.updateUI();
        showToast("You have been signed out.", "info");
    },

    updateUI() {
        const authContainer = document.getElementById("navAuthContainer");
        const userContainer = document.getElementById("navUserContainer");
        const userNameEl = document.getElementById("navUserName");
        const userZodiacEl = document.getElementById("navUserZodiac");
        const gateSection = document.getElementById("authGateSection");
        const mainApp = document.getElementById("mainAppContent");
        const navTabs = document.getElementById("mainNavTabs");

        const zodiacSymbols = {
            Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
            Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
            Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
        };

        if (this.user) {
            authContainer.classList.add("hidden");
            userContainer.classList.remove("hidden");
            userNameEl.textContent = this.user.full_name || this.user.email;
            userZodiacEl.textContent = zodiacSymbols[this.user.zodiac_sign] || "✨";

            // Unlock the actual app only for signed-in, registered users
            gateSection?.classList.add("hidden");
            mainApp?.classList.remove("hidden");
            navTabs?.classList.remove("hidden");
        } else {
            authContainer.classList.remove("hidden");
            userContainer.classList.add("hidden");

            // Lock everything behind the sign-in gate
            gateSection?.classList.remove("hidden");
            mainApp?.classList.add("hidden");
            navTabs?.classList.add("hidden");
        }
    },

    bindEvents() {
        document.getElementById("openLoginBtn")?.addEventListener("click", openLoginModal);
        document.getElementById("openRegisterBtn")?.addEventListener("click", openRegisterModal);
        document.getElementById("gateSignInBtn")?.addEventListener("click", openLoginModal);
        document.getElementById("gateRegisterBtn")?.addEventListener("click", openRegisterModal);
        document.getElementById("logoutBtn")?.addEventListener("click", () => this.logout());

        document.getElementById("switchToRegister")?.addEventListener("click", (e) => {
            e.preventDefault();
            openRegisterModal();
        });

        document.getElementById("switchToLogin")?.addEventListener("click", (e) => {
            e.preventDefault();
            openLoginModal();
        });

        // Form submissions
        document.getElementById("loginForm")?.addEventListener("submit", handleLoginSubmit);
        document.getElementById("registerForm")?.addEventListener("submit", handleRegisterSubmit);
    }
};

// Modal Open / Close Helpers
function closeAuthModals() {
    document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.add("hidden"));
}

function openLoginModal() {
    closeAuthModals();
    document.getElementById("loginModal")?.classList.remove("hidden");
}

function openRegisterModal() {
    closeAuthModals();
    document.getElementById("registerModal")?.classList.remove("hidden");
}

// Form Handlers
async function handleLoginSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("loginSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Signing In...";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            AuthState.setUser(data.user, data.user.token);
            closeAuthModals();
            showToast(`Welcome, ${data.user.full_name}! 🌟`, "success");
            if (window.onAuthSuccess) window.onAuthSuccess();
        } else {
            showToast(data.detail || data.message || "Invalid credentials", "error");
        }
    } catch (err) {
        showToast("Server connection error during login.", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Sign In";
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("regSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Creating Account...";

    const full_name = document.getElementById("regFullName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const zodiac_sign = document.getElementById("regZodiac").value;

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name, email, password, zodiac_sign })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            AuthState.setUser(data.user, data.user.token);
            closeAuthModals();
            showToast(`Account created! Welcome to Mystic Oracle, ${data.user.full_name}! ✨`, "success");
            if (window.onAuthSuccess) window.onAuthSuccess();
        } else {
            showToast(data.detail || data.message || "Registration failed", "error");
        }
    } catch (err) {
        showToast("Server connection error during registration.", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Create Account";
    }
}

// Converts simple Markdown from AI-generated readings (headings, bold,
// italics, line breaks) into safe HTML so it renders properly instead of
// showing literal **asterisks** or ### hashes. Escapes any existing HTML
// in the source text first.
function formatReadingText(text) {
    if (!text) return "";
    const escapeHtml = (str) => str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const applyInline = (str) => {
        str = str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        str = str.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, "$1<em>$2</em>");
        return str;
    };

    const lines = text.split(/\n/).map((line) => {
        const headingMatch = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            const level = Math.min(headingMatch[1].length, 4);
            const content = applyInline(escapeHtml(headingMatch[2].trim()));
            return { type: "heading", html: `<div class="reading-heading reading-heading-${level}">${content}</div>` };
        }
        return { type: "text", html: applyInline(escapeHtml(line)) };
    });

    let result = "";
    lines.forEach((line, i) => {
        if (line.type === "heading") {
            result += line.html;
        } else {
            if (i > 0 && lines[i - 1].type === "text") result += "<br>";
            result += line.html;
        }
    });
    return result;
}

// Global Toast helper
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        toast.style.transition = "all 0.3s ease-out";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => AuthState.init());
