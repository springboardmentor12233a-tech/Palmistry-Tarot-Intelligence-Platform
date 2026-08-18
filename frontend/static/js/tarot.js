// ==========================================
// MYSTIC ORACLE • TAROT ENGINE & 3D TABLE
// ==========================================

const TarotState = {
    spreadCount: 1,
    drawnCards: [],
    deck: [],

    init() {
        this.bindEvents();
        if (typeof AuthState !== "undefined" && AuthState.user) {
            this.shuffleAndDraw(3);
        }
    },

    bindEvents() {
        // Spread Mode Pickers
        document.querySelectorAll(".tarot-spread-picker .btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(".tarot-spread-picker .btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.spreadCount = parseInt(btn.dataset.spread, 10);
                this.shuffleAndDraw(this.spreadCount);
            });
        });

        document.getElementById("tarotShuffleDrawBtn")?.addEventListener("click", () => {
            this.shuffleAndDraw(this.spreadCount);
        });

        document.getElementById("tarotInterpretBtn")?.addEventListener("click", () => {
            this.interpretCurrentSpread();
        });
    },

    async shuffleAndDraw(count = 3) {
        const board = document.getElementById("tarotTableBoard");
        if (!board) return;

        board.innerHTML = `
            <div class="loading-state">
                <div class="mystic-spinner"></div>
                <p class="loading-text">Shuffling the 78 sacred archetypes...</p>
            </div>
        `;

        try {
            const res = await fetch("/api/tarot/draw", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...AuthState.authHeaders() },
                body: JSON.stringify({ count })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                this.drawnCards = data.drawn;
                this.renderCards(board);
                document.getElementById("tarotReadingOutput").innerHTML = `
                    <p class="text-muted">Cards are dealt. Click each card to reveal its divine orientation, then click <strong>Interpret with AI</strong>.</p>
                `;
            }
        } catch (err) {
            board.innerHTML = `<p class="text-muted">Failed to shuffle deck. Please try again.</p>`;
        }
    },

    getCardSymbol(card) {
        if (card.arcana === "Major Arcana") {
            const num = parseInt(card.number, 10);
            const symbols = ["🌟", "🪄", "🌙", "👑", "🏛️", "🗝️", "❤️", "🛡️", "🦁", "🏮", "☸️", "⚖️", "⏳", "💀", "🏺", "⛓️", "⚡", "⭐", "🌕", "☀️", "🎺", "🌍"];
            return symbols[num] || "🔮";
        }
        const suitSymbols = {
            "Wands": "🔥",
            "Cups": "🏆",
            "Swords": "⚔️",
            "Pentacles": "🪙"
        };
        return suitSymbols[card.suit] || "🃏";
    },

    renderCards(container) {
        container.innerHTML = "";
        
        this.drawnCards.forEach((item, index) => {
            const card = item.card;
            const isUpright = item.upright;
            const symbol = this.getCardSymbol(card);

            const cardEl = document.createElement("div");
            cardEl.className = "tarot-card-3d";
            cardEl.dataset.index = index;

            cardEl.innerHTML = `
                <!-- Card Back -->
                <div class="tarot-card-face tarot-card-back">
                    <div class="card-back-pattern">
                        <div class="card-back-sigil">🔮</div>
                        <div class="card-back-prompt">Click to Reveal</div>
                    </div>
                </div>

                <!-- Card Front -->
                <div class="tarot-card-face tarot-card-front">
                    <div class="card-front-header">
                        <span>${item.position}</span>
                        <span>#${card.number}</span>
                    </div>
                    <div class="card-front-art">
                        <div class="card-front-symbol">${symbol}</div>
                        <div class="card-front-name">${card.name}</div>
                        <div class="card-front-keywords">${card.keywords.slice(0, 3).join(" • ")}</div>
                    </div>
                    <div class="card-front-footer ${isUpright ? 'orient-upright' : 'orient-reversed'}">
                        ${item.orientation.toUpperCase()}
                    </div>
                </div>
            `;

            cardEl.addEventListener("click", () => {
                cardEl.classList.toggle("flipped");
            });

            container.appendChild(cardEl);
        });
    },

    async interpretCurrentSpread() {
        const output = document.getElementById("tarotReadingOutput");
        const btn = document.getElementById("tarotInterpretBtn");
        btn.disabled = true;
        btn.textContent = "Channeling...";

        output.innerHTML = `
            <div class="loading-state" style="padding: 20px;">
                <div class="mystic-spinner" style="width: 36px; height: 36px;"></div>
                <p class="loading-text" style="font-size: 13px;">Weaving tarot wisdom and astrological threads...</p>
            </div>
        `;

        try {
            const res = await fetch("/api/tarot/interpret", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...AuthState.authHeaders() },
                body: JSON.stringify({
                    cards: this.drawnCards,
                    question: "General Astrological Guidance & Pathway"
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                output.innerHTML = `
                    <div class="narrative-content">
                        <div class="result-badge mb-2"><span class="pulse-dot"></span> Source: ${data.source}</div>
                        <p style="white-space: pre-wrap; margin-top: 10px;">${formatReadingText(data.reading_text)}</p>
                    </div>
                `;
            } else {
                output.innerHTML = `<p class="text-muted">Could not generate interpretation. Please try again.</p>`;
            }
        } catch (err) {
            output.innerHTML = `<p class="text-muted">Error contacting interpretation oracle.</p>`;
        } finally {
            btn.disabled = false;
            btn.textContent = "🔮 Interpret with AI";
        }
    }
};

document.addEventListener("DOMContentLoaded", () => TarotState.init());
