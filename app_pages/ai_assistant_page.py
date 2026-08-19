import streamlit as st

from ai_assistant import ask_reading_assistant
from database import get_user_reading_history


# ==========================================
# PAGE
# ==========================================

def render():

    st.title("🤖 AI Reading Assistant")

    st.write(
        "Ask questions about your saved "
        "Palmistry, Tarot or Combined readings."
    )

    st.info(
        "💡 The assistant uses your saved reading "
        "information to answer your questions."
    )

    # ======================================
    # CHECK LOGIN
    # ======================================

    user = st.session_state.get("user")

    if user is None:

        st.warning(
            "Please login to use the AI Reading Assistant."
        )

        return

    user_id = user["id"]

    # ======================================
    # GET READING HISTORY
    # ======================================

    readings = get_user_reading_history(
        user_id
    )

    if not readings:

        st.warning(
            "You don't have any saved readings yet."
        )

        st.write(
            "Complete a Palmistry, Tarot or Combined "
            "reading first."
        )

        return

    # ======================================
    # READING SELECTION
    # ======================================

    st.subheader("📚 Select a Reading")

    reading_options = []

    for reading in readings:

        reading_id = reading[0]
        reading_type = reading[1]
        question = reading[2]
        cards = reading[3]
        ai_reading = reading[4]
        # Your current database function may not return
        # created_at, so don't access reading[6].
        created_at = ""

        label = (
            f"{reading_type} | "
            f"{created_at}"
        )

        if question:
            label += f" | {question}"

        reading_options.append(
            (
                label,
                reading
            )
        )

    selected_label = st.selectbox(
        "Choose the reading you want to discuss",
        [item[0] for item in reading_options]
    )

    selected_reading = next(
        item[1]
        for item in reading_options
        if item[0] == selected_label
    )

    # ======================================
    # READING DATA
    # ======================================

    reading_id = selected_reading[0]
    reading_type = selected_reading[1]
    question = selected_reading[2]
    cards = selected_reading[3]
    ai_reading = selected_reading[4]
    created_at = ""

    # ======================================
    # SHOW SELECTED READING
    # ======================================

    st.divider()

    st.subheader(
        f"🔮 {reading_type} Reading"
    )

    if question:

        st.markdown(
            f"**Question:** {question}"
        )

    if created_at:
        st.caption(
        f"Reading date: {created_at}"
    )

    # ======================================
    # BUILD CONTEXT
    # ======================================

    reading_context = f"""
Reading Type:
{reading_type}

Question:
{question}

Reading Data:
{cards}

Existing AI Interpretation:
{ai_reading}
"""

    # ======================================
    # QUESTION
    # ======================================

    st.divider()

    st.subheader(
        "💬 Ask about your reading"
    )

    question_input = st.text_area(
        "Your question",
        placeholder=(
            "Example: What is the main theme "
            "of my reading?"
        ),
        height=100,
        key="assistant_question"
    )

    # ======================================
    # SUGGESTIONS
    # ======================================

    st.markdown(
        "**💡 Try asking:**"
    )

    col1, col2 = st.columns(2)

    with col1:

        st.markdown(
            "- What is the main theme of my reading?"
        )

        st.markdown(
            "- Can you explain my reading simply?"
        )

    with col2:

        st.markdown(
            "- What should I reflect on?"
        )

        st.markdown(
            "- How are the different parts connected?"
        )

    # ======================================
    # ASK AI
    # ======================================

    if st.button(
        "🤖 Ask AI Assistant",
        type="primary",
        use_container_width=True
    ):

        if not question_input.strip():

            st.warning(
                "Please enter a question first."
            )

            return

        with st.spinner(
            "🤖 Thinking about your reading..."
        ):

            answer = ask_reading_assistant(
                question_input,
                reading_context
            )

        st.session_state[
            "assistant_answer"
        ] = answer

    # ======================================
    # DISPLAY ANSWER
    # ======================================

    answer = st.session_state.get(
        "assistant_answer"
    )

    if answer:

        st.divider()

        st.subheader(
            "🤖 AI Assistant"
        )

        st.markdown(answer)