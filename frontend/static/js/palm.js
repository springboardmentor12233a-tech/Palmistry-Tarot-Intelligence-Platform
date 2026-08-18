// ==========================================
// MYSTIC ORACLE • PALM ANALYSIS & CANVAS OVERLAY
// ==========================================

const PalmState = {
    selectedFile: null,
    currentAnalysis: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const fileInput = document.getElementById("palmTabInput");
        const uploadZone = document.getElementById("palmTabUploadZone");
        const analyzeBtn = document.getElementById("analyzePalmBtn");

        fileInput?.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleFileSelect(e.target.files[0]);
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
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        analyzeBtn?.addEventListener("click", () => {
            this.runAnalysis();
        });
    },

    handleFileSelect(file) {
        this.selectedFile = file;
        const placeholder = document.getElementById("palmTabPlaceholder");
        const preview = document.getElementById("palmTabPreview");
        const img = document.getElementById("palmTabImg");

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            placeholder.classList.add("hidden");
            preview.classList.remove("hidden");
            
            img.onload = () => {
                this.initOverlayCanvas();
            };
        };
        reader.readAsDataURL(file);
    },

    initOverlayCanvas() {
        const canvas = document.getElementById("palmOverlayCanvas");
        const img = document.getElementById("palmTabImg");
        if (!canvas || !img) return;

        canvas.width = img.clientWidth || img.naturalWidth;
        canvas.height = img.clientHeight || img.naturalHeight;
    },

    drawPalmOverlays(landmarks) {
        const canvas = document.getElementById("palmOverlayCanvas");
        const img = document.getElementById("palmTabImg");
        if (!canvas || !landmarks) return;

        const ctx = canvas.getContext("2d");
        const w = canvas.width = img.clientWidth || img.naturalWidth;
        const h = canvas.height = img.clientHeight || img.naturalHeight;
        ctx.clearRect(0, 0, w, h);

        const lineColors = {
            heart_line: { color: "#f43f5e", shadow: "rgba(244, 63, 94, 0.8)", label: "Heart Line" },
            head_line: { color: "#38bdf8", shadow: "rgba(56, 189, 248, 0.8)", label: "Head Line" },
            life_line: { color: "#22c55e", shadow: "rgba(34, 197, 94, 0.8)", label: "Life Line" },
            fate_line: { color: "#ffd700", shadow: "rgba(255, 215, 0, 0.8)", label: "Fate Line" }
        };

        for (const [lineKey, points] of Object.entries(landmarks)) {
            const style = lineColors[lineKey];
            if (!style || !points.length) continue;

            ctx.beginPath();
            ctx.strokeStyle = style.color;
            ctx.lineWidth = 3.5;
            ctx.lineCap = "round";
            ctx.shadowColor = style.shadow;
            ctx.shadowBlur = 12;

            points.forEach((pt, i) => {
                const px = (pt.x / 100) * w;
                const py = (pt.y / 100) * h;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();

            // Draw glowing endpoint
            const endPt = points[points.length - 1];
            const ex = (endPt.x / 100) * w;
            const ey = (endPt.y / 100) * h;
            ctx.beginPath();
            ctx.arc(ex, ey, 5, 0, Math.PI * 2);
            ctx.fillStyle = style.color;
            ctx.fill();
        }
    },

    async runAnalysis() {
        if (!AuthState.user) {
            showToast("Please sign in to analyze your palm.", "error");
            openLoginModal();
            return;
        }

        if (!this.selectedFile) {
            showToast("Please upload a palm photo first!", "error");
            return;
        }

        const emptyState = document.getElementById("palmEmptyState");
        const loadingState = document.getElementById("palmLoadingState");
        const resultsView = document.getElementById("palmResultsView");

        emptyState.classList.add("hidden");
        resultsView.classList.add("hidden");
        loadingState.classList.remove("hidden");

        const formData = new FormData();
        formData.append("image", this.selectedFile);

        try {
            const res = await fetch("/api/palm/analyze", {
                method: "POST",
                headers: { ...AuthState.authHeaders() },
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.success) {
                this.currentAnalysis = data;
                this.renderAnalysisResults(data);
                // Line overlay drawing intentionally disabled - the coordinates
                // aren't derived from real line detection on the photo, so we
                // just show the original uploaded image as-is.
                loadingState.classList.add("hidden");
                resultsView.classList.remove("hidden");
                showToast("Palm line analysis complete! ✨", "success");
            } else {
                showToast(data.detail || "Analysis failed.", "error");
                loadingState.classList.add("hidden");
                emptyState.classList.remove("hidden");
            }
        } catch (err) {
            showToast("Error connecting to palm engine.", "error");
            loadingState.classList.add("hidden");
            emptyState.classList.remove("hidden");
        }
    },

    renderAnalysisResults(data) {
        const linesList = document.getElementById("palmLinesList");
        const mountsList = document.getElementById("palmMountsList");
        const sourceEl = document.getElementById("palmResultSource");

        if (sourceEl) sourceEl.textContent = data.source || "Celestial Engine";

        linesList.innerHTML = "";
        mountsList.innerHTML = "";

        // Render Lines
        for (const [key, line] of Object.entries(data.lines)) {
            const card = document.createElement("div");
            card.className = "line-detail-card";
            card.innerHTML = `
                <div class="line-header">
                    <span class="line-title">${line.name}</span>
                    <span class="line-score-badge">${line.score}/100</span>
                </div>
                <div class="line-archetype">${line.archetype}</div>
                <div class="line-desc">${line.description}</div>
            `;
            linesList.appendChild(card);
        }

        // Render Mounts
        (data.mounts || []).forEach(mount => {
            const card = document.createElement("div");
            card.className = "mount-card";
            card.innerHTML = `
                <div class="mount-name">${mount.mount}</div>
                <div class="mount-strength">${mount.significance} (${mount.strength})</div>
            `;
            mountsList.appendChild(card);
        });
    }
};

document.addEventListener("DOMContentLoaded", () => PalmState.init());
