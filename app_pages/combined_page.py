import streamlit as st
from pathlib import Path

from palmistry_engine import analyze_palm
from tarot.tarot_engine import draw_three_cards
from llm_engine import generate_combined_reading
from pdf_generator import create_combined_pdf


def render():

    # ============================================================
    # ✨ COMBINED READING PAGE
    # ============================================================

    st.title("✨ Combined Palmistry + Tarot Reading")

    st.write(
        "Combine traditional Palmistry observations with a "
        "three-card Tarot reading for a broader reflective reading."
    )

    st.info(
        "ℹ️ Combined readings are intended for reflection and "
        "entertainment. Palmistry and Tarot do not scientifically "
        "predict the future."
    )

    # ============================================================
    # 📚 ABOUT COMBINED READING
    # ============================================================

    st.divider()

    st.subheader("📚 How Combined Reading Works")

    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown("### 🖐️ Palmistry")

        st.write(
            "The Palmistry system analyzes the major palm lines "
            "and provides traditional interpretations."
        )

    with col2:

        st.markdown("### 🔮 Tarot")

        st.write(
            "The Tarot system draws three cards representing "
            "Past, Present, and Future."
        )

    with col3:

        st.markdown("### ✨ Combined")

        st.write(
            "The AI looks for themes shared between the supplied "
            "Palmistry findings and Tarot cards."
        )

    # ============================================================
    # ❓ USER QUESTION
    # ============================================================

    st.divider()

    st.subheader("🎯 Your Question")

    question = st.text_input(
        "What would you like guidance about?",
        placeholder=(
            "Example: What should I focus on in my career?"
        ),
        key="combined_question_input"
    )

    # ============================================================
    # 🖐️ PALMISTRY SECTION
    # ============================================================

    st.divider()

    st.subheader("🖐️ Step 1 — Palmistry")

    st.write(
        "Upload a clear image of your palm and analyze it "
        "before continuing."
    )

    uploaded_file = st.file_uploader(
        "Choose a palm image",
        type=["jpg", "jpeg", "png", "heic"],
        key="combined_palm_upload"
    )

    if uploaded_file is not None:

        st.image(
            uploaded_file,
            caption="Uploaded Palm",
            width=400
        )

        if st.button(
            "🖐️ Analyze Palm",
            type="primary",
            key="combined_analyze_palm"
        ):

            try:

                PROJECT_ROOT = (
                    Path(__file__).resolve().parent.parent
                )

                INPUT_DIR = (
                    PROJECT_ROOT
                    / "palmistry"
                    / "code"
                    / "input"
                )

                INPUT_DIR.mkdir(
                    parents=True,
                    exist_ok=True
                )

                input_path = (
                    INPUT_DIR
                    / uploaded_file.name
                )

                with open(
                    input_path,
                    "wb"
                ) as file:

                    file.write(
                        uploaded_file.getbuffer()
                    )

                with st.spinner(
                    "🔍 Analyzing your palm..."
                ):

                    result = analyze_palm(
                        uploaded_file.name
                    )

                if result is None:

                    st.error(
                        "❌ Palm analysis failed. "
                        "Please upload a clearer palm image."
                    )

                else:

                    st.session_state[
                        "combined_palm_result"
                    ] = result

                    # Reset previous combined AI reading
                    st.session_state.pop(
                        "combined_ai_reading",
                        None
                    )

                    st.success(
                        "✅ Palm analysis completed!"
                    )

            except Exception as e:

                st.error(
                    "❌ Error during palm analysis."
                )

                st.exception(e)

    # ============================================================
    # DISPLAY PALM RESULT
    # ============================================================

    palm_result = st.session_state.get(
        "combined_palm_result"
    )

    if palm_result is not None:

        st.subheader(
            "🖐️ Palm Analysis Result"
        )

        palm_lines_image = palm_result.get(
            "palm_lines_image"
        )

        if palm_lines_image:

            palm_lines_image = Path(
                palm_lines_image
            )

            if palm_lines_image.exists():

                st.image(
                    str(palm_lines_image),
                    caption="Detected Palm Lines",
                    width=500
                )

        contents = palm_result.get(
            "contents"
        )

        if contents:

            st.markdown(
                "### 🔮 Palm Interpretations"
            )

            if len(contents) >= 6:

                st.markdown(
                    "#### ❤️ Heart Line"
                )

                st.write(
                    contents[0]
                )

                st.info(
                    contents[1]
                )

                st.markdown(
                    "#### 🧠 Head Line"
                )

                st.write(
                    contents[2]
                )

                st.info(
                    contents[3]
                )

                st.markdown(
                    "#### 🌱 Life Line"
                )

                st.write(
                    contents[4]
                )

                st.info(
                    contents[5]
                )

    # ============================================================
    # 🔮 TAROT SECTION
    # ============================================================

    st.divider()

    st.subheader(
        "🔮 Step 2 — Tarot"
    )

    st.write(
        "Draw three Tarot cards representing Past, Present, "
        "and Future."
    )

    if st.button(
        "🃏 Draw Three Tarot Cards",
        type="primary",
        key="combined_draw_tarot"
    ):

        if not question.strip():

            st.warning(
                "⚠️ Please enter your question first."
            )

        else:

            try:

                with st.spinner(
                    "🃏 Drawing your Tarot cards..."
                ):

                    reading = draw_three_cards()

                st.session_state[
                    "combined_tarot_reading"
                ] = reading

                st.session_state[
                    "combined_question_saved"
                ] = question

                # Reset previous combined AI reading
                st.session_state.pop(
                    "combined_ai_reading",
                    None
                )

                st.success(
                    "✨ Three Tarot cards have been drawn!"
                )

            except Exception as e:

                st.error(
                    "❌ Unable to draw Tarot cards."
                )

                st.exception(e)

    # ============================================================
    # GET SAVED QUESTION
    # ============================================================

    saved_question = st.session_state.get(
        "combined_question_saved",
        question
    )

    # ============================================================
    # DISPLAY TAROT RESULT
    # ============================================================

    tarot_reading = st.session_state.get(
        "combined_tarot_reading"
    )

    if tarot_reading is not None:

        st.subheader(
            "🎴 Tarot Cards"
        )

        positions = [
            "Past",
            "Present",
            "Future"
        ]

        cols = st.columns(3)

        for col, position, item in zip(
            cols,
            positions,
            tarot_reading
        ):

            card = item["card"]

            orientation = item[
                "orientation"
            ]

            with col:

                st.markdown(
                    f"### {position}"
                )

                # --------------------------------------------
                # CARD IMAGE
                # --------------------------------------------

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
                        width=250
                    )

                else:

                    st.warning(
                        f"Image not found: {card['img']}"
                    )

                # --------------------------------------------
                # CARD NAME
                # --------------------------------------------

                st.markdown(
                    f"**🃏 {card['name']}**"
                )

                # --------------------------------------------
                # ARCANA
                # --------------------------------------------

                st.write(
                    f"**Arcana:** {card['arcana']}"
                )

                # --------------------------------------------
                # SUIT
                # --------------------------------------------

                st.write(
                    f"**Suit:** {card['suit']}"
                )

                # --------------------------------------------
                # ORIENTATION
                # --------------------------------------------

                st.write(
                    f"**Orientation:** {orientation}"
                )

                # --------------------------------------------
                # KEYWORDS
                # --------------------------------------------

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

                # --------------------------------------------
                # MEANINGS
                # --------------------------------------------

                st.write(
                    "**Meaning:**"
                )

                meanings = card[
                    "meanings"
                ].get(
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
                        "No meaning available."
                    )

    # ============================================================
    # CHECK BOTH READINGS
    # ============================================================

    palm_result = st.session_state.get(
        "combined_palm_result"
    )

    tarot_reading = st.session_state.get(
        "combined_tarot_reading"
    )

    # ============================================================
    # 🤖 COMBINED AI INTERPRETATION
    # ============================================================

    if (
        palm_result is not None
        and tarot_reading is not None
    ):

        st.divider()

        st.subheader(
            "🤖 Combined AI Interpretation"
        )

        st.write(
            "Your Palmistry and Tarot results are ready. "
            "Generate a combined reflective interpretation."
        )

        if st.button(
            "✨ Generate Combined AI Reading",
            type="primary",
            key="combined_ai_button"
        ):

            if not saved_question.strip():

                st.warning(
                    "⚠️ Please enter a question."
                )

            else:

                palm_contents = palm_result.get(
                    "contents"
                )

                if not palm_contents:

                    st.error(
                        "❌ Palm interpretation data is missing."
                    )

                else:

                    try:

                        with st.spinner(
                            "✨ AI is combining your "
                            "Palmistry and Tarot readings..."
                        ):

                            combined_reading = (
                                generate_combined_reading(
                                    saved_question,
                                    palm_contents,
                                    tarot_reading
                                )
                            )

                        st.session_state[
                            "combined_ai_reading"
                        ] = combined_reading

                        st.success(
                            "✨ Combined AI reading generated!"
                        )

                    except Exception as e:

                        error_message = str(e)

                        if (
                            "429" in error_message
                            or
                            "RESOURCE_EXHAUSTED"
                            in error_message
                        ):

                            st.warning(
                                "⚠️ Gemini AI quota has "
                                "currently been reached. "
                                "Your Palmistry and Tarot "
                                "results are still available."
                            )

                        else:

                            st.error(
                                "❌ Unable to generate the "
                                "combined AI interpretation."
                            )

                            st.code(
                                error_message
                            )

    # ============================================================
    # DISPLAY COMBINED AI RESULT
    # ============================================================

    combined_ai_reading = st.session_state.get(
        "combined_ai_reading"
    )

    if combined_ai_reading:

        st.divider()

        st.subheader(
            "✨ Combined Reading"
        )

        st.markdown(
            combined_ai_reading
        )

        st.info(
            "This combined interpretation is intended "
            "for reflection and entertainment."
        )

    # ============================================================
    # 📥 DOWNLOAD COMBINED READING AS PDF
    # ============================================================

    if (
        palm_result is not None
        and tarot_reading is not None
    ):

        st.divider()

        st.subheader(
            "📥 Download Combined Reading"
        )

        st.write(
            "Download your complete Palmistry + Tarot "
            "reading as a professionally formatted PDF."
        )

        if st.button(
            "📄 Create Combined Reading PDF",
            type="primary",
            key="create_combined_pdf_button"
        ):

            try:

                # ------------------------------------------------
                # Get Palmistry contents
                # ------------------------------------------------

                palm_contents = palm_result.get(
                    "contents",
                    []
                )

                # ------------------------------------------------
                # Get AI reading safely from session state
                # ------------------------------------------------

                ai_reading = st.session_state.get(
                    "combined_ai_reading"
                )

                # ------------------------------------------------
                # PDF location
                # ------------------------------------------------

                PROJECT_ROOT = (
                    Path(__file__).resolve().parent.parent
                )

                pdf_directory = (
                    PROJECT_ROOT
                    / "generated_reports"
                )

                pdf_directory.mkdir(
                    parents=True,
                    exist_ok=True
                )

                pdf_path = (
                    pdf_directory
                    / "combined_palmistry_tarot_reading.pdf"
                )

                # ------------------------------------------------
                # Create PDF
                # ------------------------------------------------

                with st.spinner(
                    "📄 Creating your Combined Reading PDF..."
                ):

                    create_combined_pdf(
                        file_path=pdf_path,
                        question=saved_question,
                        palm_contents=palm_contents,
                        tarot_reading=tarot_reading,
                        ai_reading=ai_reading
                    )

                st.success(
                    "✅ Combined Reading PDF created successfully!"
                )

                # ------------------------------------------------
                # Download PDF
                # ------------------------------------------------

                with open(
                    pdf_path,
                    "rb"
                ) as pdf_file:

                    st.download_button(
                        label="📥 Download Combined Reading PDF",
                        data=pdf_file,
                        file_name=(
                            "combined_palmistry_tarot_reading.pdf"
                        ),
                        mime="application/pdf",
                        key="download_combined_pdf"
                    )

            except Exception as e:

                st.error(
                    "❌ Unable to create Combined Reading PDF."
                )

                st.exception(e)