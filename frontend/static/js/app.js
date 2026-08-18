// ==========================================
// MYSTIC ORACLE • MAIN APP CONTROLLER
// ==========================================

const App = {
    combinedCards: [],
    combinedFile: null,
    currentPdfUrl: null,

    init() {
        this.generateCosmicStars();
        this.bindTabs();
        this.bindCombinedEvents();
        // Only draw cards once the user is actually signed in - the draw
        // endpoint itself now requires authentication.
        if (AuthState.user) {
            this.initCombinedTarotDrawer();
        }
    },

    // Dynamic Starfield Generation
    generateCosmicStars() {
        const container = document.getElementById("starsContainer");
        if (!container) return;

        const starCount = 90;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement("div");
            star.className = "star";
            const size = Math.random() * 2.5 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.left = `${Math.random() * 100}vw`;
            star.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
            container.appendChild(star);
        }
    },

    // Tab Navigation
    bindTabs() {
        document.querySelectorAll(".nav-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const targetTab = tab.dataset.tab;
                document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

                tab.classList.add("active");
                document.getElementById(`tab-${targetTab}`)?.classList.add("active");

                if (targetTab === "history") {
                    this.loadUserHistory();
                }
            });
        });
    },

    // Combined Reading Flow
    bindCombinedEvents() {
        const uploadInput = document.getElementById("combinedPalmInput");
        const uploadZone = document.getElementById("combinedUploadZone");
        const removeBtn = document.getElementById("combinedRemoveImgBtn");
        const reshuffleBtn = document.getElementById("combinedReshuffleBtn");
        const generateBtn = document.getElementById("generateCombinedBtn");
        const downloadPdfBtn = document.getElementById("combinedDownloadPdfBtn");

        uploadInput?.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleCombinedFile(e.target.files[0]);
            }
        });

        uploadZone?.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadZone.classList.add("dragover");
        });

        uploadZone?.addEventListener("dragleave", () => {
            uploadZone.classList.remove("dragover");
        });

        uploadZone?.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadZone.classList.remove("dragover");
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this.handleCombinedFile(e.dataTransfer.files[0]);
            }
        });

        removeBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.clearCombinedFile();
        });

        reshuffleBtn?.addEventListener("click", () => {
            this.initCombinedTarotDrawer();
        });

        generateBtn?.addEventListener("click", () => {
            this.runCombinedReading();
        });

        downloadPdfBtn?.addEventListener("click", () => {
            if (this.currentPdfUrl) {
                this.openPdf(this.currentPdfUrl);
            }
        });
    },

    // Download links are plain GET requests (opened in a new tab), so they
    // can't carry an Authorization header - pass the session token as a
    // query param instead; the backend accepts either.
    openPdf(url) {
        if (!AuthState.token) {
            showToast("Please sign in to download reports.", "error");
            return;
        }
        const sep = url.includes("?") ? "&" : "?";
        window.open(`${url}${sep}token=${encodeURIComponent(AuthState.token)}`, "_blank");
    },

    handleCombinedFile(file) {
        this.combinedFile = file;
        const placeholder = document.getElementById("combinedUploadPlaceholder");
        const preview = document.getElementById("combinedUploadPreview");
        const img = document.getElementById("combinedPreviewImg");

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            placeholder.classList.add("hidden");
            preview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    },

    clearCombinedFile() {
        this.combinedFile = null;
        document.getElementById("combinedPalmInput").value = "";
        document.getElementById("combinedUploadPlaceholder").classList.remove("hidden");
        document.getElementById("combinedUploadPreview").classList.add("hidden");
    },

    async initCombinedTarotDrawer() {
        const container = document.getElementById("combinedMiniCards");
        if (!container) return;

        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 10px; color: var(--text-muted); font-size: 12px;">
                Drawing cards...
            </div>
        `;

        try {
            const res = await fetch("/api/tarot/draw", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...AuthState.authHeaders() },
                body: JSON.stringify({ count: 3 })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                this.combinedCards = data.drawn;
                this.renderCombinedMiniCards(container);
            }
        } catch (err) {
            container.innerHTML = `<p class="text-muted">Cards ready</p>`;
        }
    },

    renderCombinedMiniCards(container) {
        container.innerHTML = "";
        this.combinedCards.forEach(c => {
            const cardEl = document.createElement("div");
            cardEl.className = "mini-card-item";
            cardEl.innerHTML = `
                <div class="mini-card-pos">${c.position}</div>
                <div class="mini-card-name">${c.card.name}</div>
                <div class="mini-card-orient ${c.upright ? 'orient-upright' : 'orient-reversed'}">
                    ${c.orientation}
                </div>
            `;
            container.appendChild(cardEl);
        });
    },

    async runCombinedReading() {
        if (!AuthState.user) {
            showToast("Please sign in to generate a reading.", "error");
            openLoginModal();
            return;
        }

        const question = document.getElementById("combinedQuestion").value.trim();
        if (!question) {
            showToast("Please enter your question or inquiry!", "error");
            return;
        }

        const emptyState = document.getElementById("combinedEmptyState");
        const loadingState = document.getElementById("combinedLoadingState");
        const resultView = document.getElementById("combinedResultView");

        emptyState.classList.add("hidden");
        resultView.classList.add("hidden");
        loadingState.classList.remove("hidden");

        const formData = new FormData();
        formData.append("question", question);
        formData.append("cards_json", JSON.stringify(this.combinedCards));

        if (this.combinedFile) {
            formData.append("image", this.combinedFile);
        }

        try {
            const res = await fetch("/api/readings/combined", {
                method: "POST",
                headers: { ...AuthState.authHeaders() },
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.success) {
                this.renderCombinedResult(data);
                loadingState.classList.add("hidden");
                resultView.classList.remove("hidden");
                showToast("Your Destiny Reading is manifested! 🌟", "success");
            } else {
                showToast(data.detail || "Reading generation failed", "error");
                loadingState.classList.add("hidden");
                emptyState.classList.remove("hidden");
            }
        } catch (err) {
            showToast("Error connecting to combined reading oracle.", "error");
            loadingState.classList.add("hidden");
            emptyState.classList.remove("hidden");
        }
    },

    renderCombinedResult(data) {
        this.currentPdfUrl = data.pdf_download_url;
        document.getElementById("combinedResultSource").textContent = data.source || "Celestial Engine";

        // Render Palm highlights if available
        const metricsContainer = document.getElementById("combinedPalmMetrics");
        metricsContainer.innerHTML = "";
        if (data.palm_data && data.palm_data.lines) {
            for (const [key, line] of Object.entries(data.palm_data.lines)) {
                const pill = document.createElement("div");
                pill.className = "metric-pill";
                pill.innerHTML = `
                    <div class="metric-pill-header">
                        <span class="metric-pill-name">${line.name.split(" ")[0]} Line</span>
                        <span class="metric-pill-score">${line.score}/100</span>
                    </div>
                    <div class="metric-pill-archetype">${line.archetype}</div>
                `;
                metricsContainer.appendChild(pill);
            }
        }

        // Render Narrative
        document.getElementById("combinedNarrativeText").innerHTML = formatReadingText(data.reading_text);
    },

    // Load and Render Reading History
    async loadUserHistory() {
        const container = document.getElementById("historyListContainer");
        const emptyState = document.getElementById("historyEmptyState");
        const itemsGrid = document.getElementById("historyItemsGrid");

        if (!AuthState.user) {
            emptyState.innerHTML = `
                <div class="empty-oracle-symbol">📜</div>
                <h3>Sign In Required</h3>
                <p>Please <a href="#" onclick="openLoginModal()" class="link-gold">Sign In</a> or <a href="#" onclick="openRegisterModal()" class="link-gold">Register</a> to view your reading chronicles.</p>
            `;
            emptyState.classList.remove("hidden");
            itemsGrid.classList.add("hidden");
            return;
        }

        try {
            const res = await fetch(`/api/readings/history`, {
                headers: { ...AuthState.authHeaders() }
            });
            const data = await res.json();

            if (res.ok && data.success && data.readings.length > 0) {
                emptyState.classList.add("hidden");
                itemsGrid.classList.remove("hidden");
                itemsGrid.innerHTML = "";

                data.readings.forEach(r => {
                    const card = document.createElement("div");
                    card.className = "history-card-item";
                    
                    const formattedDate = new Date(r.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    const cardsList = (r.tarot_cards || []).map(c => 
                        `<span class="chip">${c.card?.name || "Card"} (${c.orientation || "Up"})</span>`
                    ).join("");

                    card.innerHTML = `
                        <div class="history-left">
                            <h4>"${r.question || "Destiny Reading"}"</h4>
                            <div class="history-date">📅 ${formattedDate} • Type: <strong>${r.reading_type.toUpperCase()}</strong></div>
                            <div class="history-chips">${cardsList}</div>
                        </div>
                        <div class="history-right">
                            <button class="btn btn-sm btn-gold" onclick="App.reDownloadPdf('${r.question.replace(/'/g, "\\'")}', '${r.reading_text.replace(/'/g, "\\'")}', ${JSON.stringify(r.tarot_cards).replace(/"/g, '&quot;')}, ${JSON.stringify(r.palm_data).replace(/"/g, '&quot;')})">
                                📥 PDF
                            </button>
                        </div>
                    `;
                    itemsGrid.appendChild(card);
                });
            } else {
                emptyState.innerHTML = `
                    <div class="empty-oracle-symbol">📜</div>
                    <h3>No Readings Manifested Yet</h3>
                    <p>Generate a Tarot or Combined Reading to begin recording your destiny history.</p>
                `;
                emptyState.classList.remove("hidden");
                itemsGrid.classList.add("hidden");
            }
        } catch (err) {
            emptyState.classList.remove("hidden");
            itemsGrid.classList.add("hidden");
        }
    },

    async reDownloadPdf(question, reading_text, cards, palm_data) {
        showToast("Generating PDF report...", "info");
        try {
            const res = await fetch("/api/reports/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...AuthState.authHeaders() },
                body: JSON.stringify({
                    user_name: AuthState.user ? AuthState.user.full_name : "Mystic Seeker",
                    question: question,
                    reading_text: reading_text,
                    cards: cards || [],
                    palm_data: palm_data || null
                })
            });
            const data = await res.json();
            if (res.ok && data.pdf_download_url) {
                this.openPdf(data.pdf_download_url);
            }
        } catch (err) {
            showToast("Failed to download report.", "error");
        }
    }
};

// Runs after a successful login/register - populate the combined-reading
// tarot drawer now that the auth-gated endpoints are usable.
window.onAuthSuccess = () => {
    if (!App.combinedCards.length) {
        App.initCombinedTarotDrawer();
    }
    if (typeof TarotState !== "undefined" && !TarotState.drawnCards.length) {
        TarotState.shuffleAndDraw(TarotState.spreadCount);
    }
    if (window.loadUserHistory) window.loadUserHistory();
};

function setCombinedPrompt(promptText) {
    const input = document.getElementById("combinedQuestion");
    if (input) input.value = promptText;
}

window.loadUserHistory = () => App.loadUserHistory();
document.addEventListener("DOMContentLoaded", () => App.init());
