import streamlit as st
from pathlib import Path

from tarot.tarot_engine import draw_three_cards
from llm_engine import generate_tarot_reading
from pdf_generator import create_tarot_pdf

# ============================================================
# 🔮 TAROT PAGE
# ============================================================

def render():
    # Always initialize AI reading
    ai_reading = st.session_state.get(
        "tarot_ai_reading",
        None
    )
    # ========================================================
    # 🔮 PAGE TITLE
    # ========================================================
    st.success("🟢 TAROT PAGE IS LOADING")
    st.title("🔮 Tarot Reading")

    st.write(
        "Explore the basics of Tarot and receive a reflective "
        "three-card reading based on your question."
    )

    # ========================================================
    # 📚 TAROT KNOWLEDGE
    # ========================================================

    st.divider()

    st.subheader("📚 About Tarot")

    st.write(
        "Tarot is a traditional symbolic practice that uses "
        "cards to encourage reflection and explore different "
        "perspectives on situations, choices, and experiences."
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown("### 🃏 Major Arcana")

        st.write(
            "Major Arcana cards are traditionally associated "
            "with major themes, experiences, transitions, "
            "and important life lessons."
        )

    with col2:

        st.markdown("### 🎴 Minor Arcana")

        st.write(
            "Minor Arcana cards generally explore everyday "
            "experiences, situations, emotions, and actions."
        )

    with col3:

        st.markdown("### ☀️ Light & 🌑 Shadow")

        st.write(
            "In this application, card orientation is used "
            "to explore constructive and challenging aspects "
            "of a card."
        )

    st.info(
        "ℹ️ Tarot readings are intended for reflection and "
        "entertainment. They do not scientifically predict "
        "the future or provide guaranteed outcomes."
    )

    # ========================================================
    # 🃏 TAROT SPREAD
    # ========================================================

    st.divider()

    st.subheader("🃏 Choose Your Tarot Spread")

    spread = st.selectbox(
        "Choose a Tarot spread",
        [
            "Three Card — Past / Present / Future"
        ],
        key="tarot_spread"
    )

    if spread == "Three Card — Past / Present / Future":

        st.write(
            "Draw three cards representing your Past, "
            "Present, and Future."
        )

    # ========================================================
    # ❓ USER QUESTION
    # ========================================================

    question = st.text_input(
        "What would you like guidance about?",
        placeholder="Example: What should I focus on in my career?",
        key="tarot_question_input"
    )

    # ========================================================
    # 🃏 DRAW THREE CARDS
    # ========================================================

    st.divider()

    draw_button = st.button(
        "🃏 Draw Three Cards",
        type="primary",
        key="draw_tarot_button"
    )

    if draw_button:

        if not question.strip():

            st.warning(
                "⚠️ Please enter a question before drawing "
                "your cards."
            )

        else:

            with st.spinner(
                "🃏 Drawing your three cards..."
            ):

                reading = draw_three_cards()

            st.session_state["tarot_reading"] = reading
            st.session_state["tarot_question_saved"] = question

            st.success(
                "✨ Your three cards have been drawn!"
            )


    # ========================================================
    # 🔮 GET SAVED READING
    # ========================================================

    reading = st.session_state.get(
        "tarot_reading"
    )

    saved_question = st.session_state.get(
        "tarot_question_saved",
        question
    )

    if reading is None:

        return


    # ========================================================
    # 📋 READING FOCUS
    # ========================================================

    st.divider()

    st.subheader("🎯 Reading Focus")

    if saved_question:

        st.info(
            f"Your question: {saved_question}"
        )


    # ========================================================
    # 🔮 OVERALL READING
    # ========================================================

    st.subheader("🔮 Overall Reading")

    positions = [
        "Past",
        "Present",
        "Future"
    ]

    for position, item in zip(
        positions,
        reading
    ):

        card = item["card"]
        orientation = item["orientation"]

        meanings = card["meanings"].get(
            orientation,
            []
        )

        if meanings:

            st.write(
                f"**{position}:** "
                f"{card['name']} — "
                f"{meanings[0]}"
            )

        else:

            st.write(
                f"**{position}:** "
                f"{card['name']}"
            )


    # ========================================================
    # 🎴 THREE CARD DISPLAY
    # ========================================================

    st.divider()

    st.subheader("🎴 Your Three Cards")

    cols = st.columns(3)

    for col, item in zip(
        cols,
        reading
    ):

        position = item["position"]

        card = item["card"]

        orientation = item["orientation"]

        with col:

            # ----------------------------------------------
            # POSITION
            # ----------------------------------------------

            st.markdown(
                f"### {position}"
            )

            # ----------------------------------------------
            # CARD IMAGE
            # ----------------------------------------------

            image_path = (
                Path(__file__).parent.parent
                / "tarot"
                / "cards"
                / card["img"]
            )

            if image_path.exists():

                st.image(
                    str(image_path),
                    caption=card["name"],
                    width=300
                )

            else:

                st.warning(
                    "Card image not found: "
                    f"{card['img']}"
                )

            # ----------------------------------------------
            # CARD NAME
            # ----------------------------------------------

            st.markdown(
                f"🃏 **{card['name']}**"
            )

            # ----------------------------------------------
            # ORIENTATION
            # ----------------------------------------------

            if orientation == "light":

                st.success(
                    "☀️ Light"
                )

            else:

                st.warning(
                    "🌑 Shadow"
                )

            # ----------------------------------------------
            # ARCANA
            # ----------------------------------------------

            st.write(
                f"**Arcana:** {card['arcana']}"
            )

            # ----------------------------------------------
            # SUIT
            # ----------------------------------------------

            st.write(
                f"**Suit:** {card['suit']}"
            )

            # ----------------------------------------------
            # KEYWORDS
            # ----------------------------------------------

            st.write(
                "**Keywords:**"
            )

            keywords = card.get(
                "keywords",
                []
            )

            if keywords:

                st.write(
                    ", ".join(keywords)
                )

            else:

                st.write(
                    "No keywords available."
                )

            # ----------------------------------------------
            # INTERPRETATION
            # ----------------------------------------------

            st.write(
                "**Interpretation:**"
            )

            meanings = card["meanings"].get(
                orientation,
                []
            )

            if meanings:

                for meaning in meanings:

                    st.write(
                        f"• {meaning}"
                    )

            else:

                st.write(
                    "No interpretation available."
                )

            # ----------------------------------------------
            # FORTUNE TELLING
            # ----------------------------------------------

            st.markdown(
                "**Fortune Telling:**"
            )

            fortune_telling = card.get(
                "fortune_telling",
                []
            )

            if fortune_telling:

                for fortune in fortune_telling:

                    st.write(
                        f"• {fortune}"
                    )

            else:

                st.write(
                    "No fortune-telling information available."
                )

            # ----------------------------------------------
            # QUESTIONS TO ASK
            # ----------------------------------------------

            st.markdown(
                "**Questions to Ask:**"
            )

            questions = card.get(
                "Questions to Ask",
                []
            )

            if questions:

                for question_item in questions:

                    st.write(
                        f"• {question_item}"
                    )

            else:

                st.write(
                    "No questions available."
                )


    # ========================================================
    # 🤖 AI TAROT INTERPRETATION
    # ========================================================

    st.divider()

    st.subheader(
        "🤖 AI Tarot Interpretation"
    )

    st.write(
        "Generate a personalized interpretation based "
        "on your question and the three cards drawn."
    )

    ai_button_clicked = st.button(
        "✨ Generate AI Tarot Interpretation",
        type="primary",
        key="ai_tarot_button"
    )

    if ai_button_clicked:

        try:

            with st.spinner(
                "✨ AI is interpreting your cards..."
            ):

                ai_reading = generate_tarot_reading(
                    saved_question,
                    reading
                )

            st.session_state[
                "ai_tarot_reading"
            ] = ai_reading

        except Exception as e:

            error_message = str(e)

            if (
                "429" in error_message
                or
                "RESOURCE_EXHAUSTED" in error_message
            ):

                st.warning(
                    "⚠️ AI interpretation is temporarily "
                    "unavailable because the Gemini API "
                    "quota has been reached. "
                    "Please try again later."
                )

            else:

                st.error(
                    "❌ Unable to generate AI Tarot "
                    "interpretation. Please try again."
                )


    # ========================================================
    # 🔮 DISPLAY AI READING
    # ========================================================

    if "ai_tarot_reading" in st.session_state:

        st.divider()

        st.subheader(
            "🔮 AI Interpretation"
        )

        st.markdown(
            st.session_state[
                "ai_tarot_reading"
            ]
        )

        st.info(
            "This interpretation is intended for "
            "reflection and entertainment."
        )


    # ========================================================
    # 📥 DOWNLOAD TAROT READING AS PDF
    # ========================================================

    st.divider()

    st.subheader(
        "📥 Download Tarot Reading"
    )

    pdf_path = Path(
        "tarot_reading.pdf"
    )

    try:

        create_tarot_pdf(
            file_path=pdf_path,
            question=saved_question,
            reading=reading,
            ai_reading=st.session_state.get("ai_tarot_reading")
        )
        

        with open(
            pdf_path,
            "rb"
        ) as pdf_file:

            st.download_button(
                label="📄 Download Tarot Reading PDF",
                data=pdf_file,
                file_name="Tarot_Reading.pdf",
                mime="application/pdf",
                key="download_tarot_pdf",
                use_container_width=True
            )

    except Exception as e:

        st.error(
            "Unable to create Tarot PDF."
        )

        st.exception(e)