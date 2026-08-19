import streamlit as st
from pathlib import Path

from palmistry_engine import analyze_palm
from llm_engine import generate_palm_reading
from database import save_reading, update_reading_ai
from pdf_generator import create_palmistry_pdf
def render():
   
    # ========================================================
    # 🖐️ PALMISTRY PAGE
    # ========================================================

    st.title("🖐️ Palmistry Reading")

    st.write(
        "Explore the basics of Palmistry and analyze "
        "the major lines of your palm."
    )

    # ========================================================
    # 📚 PALMISTRY KNOWLEDGE
    # ========================================================

    st.subheader("📚 About Palmistry")

    st.write(
        "Palmistry is a traditional practice that interprets "
        "the lines and features of the palm. This application "
        "focuses on three major palm lines."
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("### ❤️ Heart Line")
        st.write(
            "Traditionally associated with emotions, "
            "relationships, affection, and emotional expression."
        )

    with col2:
        st.markdown("### 🧠 Head Line")
        st.write(
            "Traditionally associated with thinking, "
            "reasoning, intellectual interests, and decision-making."
        )

    with col3:
        st.markdown("### 🌱 Life Line")
        st.write(
            "Traditionally associated with experiences, "
            "vitality, major changes, and important life phases."
        )

    st.info(
        "ℹ️ Palmistry interpretations are intended for "
        "reflection and entertainment. They are not "
        "scientific predictions or medical advice."
    )

    st.divider()

    # ========================================================
    # 📷 UPLOAD
    # ========================================================

    st.subheader("📷 Upload Your Palm")

    uploaded_file = st.file_uploader(
        "Choose a palm image",
        type=["jpg", "jpeg", "png", "heic"],
        key="palm_upload"
    )

    # ========================================================
    # UPLOAD + ANALYZE
    # ========================================================

    if uploaded_file is not None:

        st.image(
            uploaded_file,
            caption="Uploaded Palm",
            width="stretch"
        )

        st.success(
            "Palm image uploaded successfully."
        )

        if st.button(
            "🔍 Analyze Palm",
            type="primary",
            key="analyze_palm_button"
        ):

            st.write("🟢 Analyze button clicked!")

            try:

                # --------------------------------------------
                # Project paths
                # --------------------------------------------

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

                # --------------------------------------------
                # Save uploaded image
                # --------------------------------------------

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

                st.write(
                    "✅ Image saved successfully."
                )

                # --------------------------------------------
                # Run Palmistry
                # --------------------------------------------

                with st.spinner(
                    "🔍 Analyzing your palm..."
                ):

                    result = analyze_palm(
                        uploaded_file.name
                    )

                # --------------------------------------------
                # Check result
                # --------------------------------------------

                if result is None:

                    st.error(
                        "❌ Palm analysis returned no result."
                    )

                else:

                    st.session_state[
                        "palm_result"
                    ] = result

                    # Reset previous AI reading
                    st.session_state.pop(
                        "ai_palm_reading",
                        None
                    )
                    # ==========================================
                    # SAVE PALM READING
                    # ==========================================

                    user = st.session_state.get("user")

                    if user is not None:

                        user_id = user["id"]

                        contents = result.get(
                            "contents",
                            []
                        )

                        reading_id = save_reading(
                            reading_type="Palmistry",
                            question="Palmistry Reading",
                            cards=str(contents),
                            ai_reading="",
                            user_id=user_id
                        )

                        st.session_state[
                            "palm_reading_id"
                        ] = reading_id

                        st.success(
                            "✅ Palm analysis completed successfully!"
                    
                        )

            except Exception as e:

                st.error(
                    "❌ Error during palm analysis."
                )

                st.exception(e)

    # ========================================================
    # GET PALM RESULT
    # ========================================================

    result = st.session_state.get(
        "palm_result"
    )

    if result is None:
        return

    # ========================================================
    # 🖐️ PALM ANALYSIS
    # ========================================================

    st.divider()

    st.subheader(
        "🖐️ Palm Line Analysis"
    )

    # ========================================================
    # FINAL RESULT IMAGE
    # ========================================================

    result_image = result.get(
        "result_image"
    )

    if result_image:

        result_image = Path(
            result_image
        )

        if result_image.exists():

            st.image(
                str(result_image),
                caption="Detected Palm Lines",
                width="stretch"
            )

    # ========================================================
    # PROCESSING PIPELINE
    # ========================================================

    st.subheader(
        "🔬 Processing Pipeline"
    )

    col1, col2 = st.columns(2)

    with col1:

        st.markdown(
            "#### 🧹 Background Removed"
        )

        clean_image = result.get(
            "clean_image"
        )

        if clean_image:

            clean_image = Path(
                clean_image
            )

            if clean_image.exists():

                st.image(
                    str(clean_image),
                    caption="Palm without background",
                    width="stretch"
                )

    with col2:

        st.markdown(
            "#### 📐 Palm Rectification"
        )

        warped_image = result.get(
            "warped_image"
        )

        if warped_image:

            warped_image = Path(
                warped_image
            )

            if warped_image.exists():

                st.image(
                    str(warped_image),
                    caption="Warped palm",
                    width="stretch"
                )

    # ========================================================
    # DETECTED PALM LINES
    # ========================================================

    st.markdown(
        "#### 🩻 Detected Palm Lines"
    )

    palm_lines_image = result.get(
        "palm_lines_image"
    )

    if palm_lines_image:

        palm_lines_image = Path(
            palm_lines_image
        )

        if palm_lines_image.exists():

            col1, col2, col3 = st.columns([1, 2, 1])

            with col2:

                st.image(
                    str(palm_lines_image),
                    caption="Detected principal palm lines",
                    width=450
                )

    # ========================================================
    # 🔮 NORMAL PALM INTERPRETATIONS
    # ========================================================

    contents = result.get(
        "contents"
    )

    if contents is None:

        st.error(
            "❌ Palm analysis did not return interpretations."
        )

        st.write("Returned result keys:")

        st.write(
            list(result.keys())
        )

        return

    st.subheader(
        "🔮 Palm Interpretations"
    )

    # --------------------------------------------------------
    # Heart
    # --------------------------------------------------------

    if len(contents) >= 2:

        st.markdown(
            "### ❤️ Heart Line"
        )

        st.write(
            contents[0]
        )

        st.info(
            contents[1]
        )

    # --------------------------------------------------------
    # Head
    # --------------------------------------------------------

    if len(contents) >= 4:

        st.markdown(
            "### 🧠 Head Line"
        )

        st.write(
            contents[2]
        )

        st.info(
            contents[3]
        )

    # --------------------------------------------------------
    # Life
    # --------------------------------------------------------

    if len(contents) >= 6:

        st.markdown(
            "### 🌱 Life Line"
        )

        st.write(
            contents[4]
        )

        st.info(
            contents[5]
        )

    # ========================================================
    # 🤖 AI PALM INTERPRETATION
    # ========================================================

    st.divider()

    st.subheader(
        "🤖 AI Palm Interpretation"
    )

    st.write(
        "Generate a personalized AI-assisted interpretation "
        "based on the detected Heart Line, Head Line, "
        "and Life Line."
    )

    # --------------------------------------------------------
    # AI BUTTON
    # --------------------------------------------------------

    ai_button_clicked = st.button(
        "✨ Generate AI Palm Interpretation",
        type="primary",
        key="ai_palm_button"
    )

    # --------------------------------------------------------
    # AI GENERATION
    # --------------------------------------------------------

    if ai_button_clicked:

        try:

            with st.spinner(
                "✨ AI is interpreting your palm..."
            ):

                ai_reading = generate_palm_reading(
                    contents
                )

            st.session_state[
                "ai_palm_reading"
            ] = ai_reading
            # ==========================================
            # UPDATE SAVED PALM READING WITH AI
            # ==========================================

            reading_id = st.session_state.get(
                "palm_reading_id"
            )

            if reading_id:

                update_reading_ai(
                    reading_id,
                    ai_reading
                )
        except Exception as e:
            error_message = str(e)
            if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:

                st.warning(
                    "⚠️ AI interpretation is temporarily unavailable "
                    "because the Gemini API quota has been reached. "
                    "Please try again later."
                )

            else:
                st.error(
                    "❌ Unable to generate AI palm interpretation."
                )

            

    # ========================================================
    # DISPLAY AI RESULT
    # ========================================================

    ai_reading = st.session_state.get(
        "ai_palm_reading"
    )

    if ai_reading:

        st.divider()

        st.subheader(
            "🔮 AI Interpretation"
        )

        st.markdown(
            ai_reading
        )

        st.info(
            "This AI interpretation is for reflection "
            "and entertainment. It is not a scientific "
            "prediction or medical advice."
        )
    # ========================================================
    # 📥 DOWNLOAD PALM READING AS PDF
    # ========================================================

    st.divider()

    st.subheader("📥 Download Palm Reading")

    pdf_path = Path(
        "palmistry_reading.pdf"
    )

    try:

        create_palmistry_pdf(
            pdf_path,
            contents,
            ai_reading
        )

        with open(
            pdf_path,
            "rb"
        ) as pdf_file:

            st.download_button(
                label="📄 Download Palm Reading PDF",
                data=pdf_file,
                file_name="Palmistry_Reading.pdf",
                mime="application/pdf",
                key="download_palm_pdf",
                use_container_width=True
            )

    except Exception as e:

        st.error(
            "Unable to create Palmistry PDF."
        )

        st.exception(e)