import streamlit as st
import json

from database import get_user_reading_history


def render():

    # ==================================================
    # 📚 READING HISTORY
    # ==================================================

    st.title("📚 Reading History")

    st.write(
        "View your previous Palmistry, Tarot, and Combined readings."
    )

    # ==================================================
    # GET LOGGED-IN USER
    # ==================================================

    user = st.session_state.get("user")

    if user is None:

        st.warning(
            "⚠️ Please log in to view your reading history."
        )

        return
    user_id = user["id"]
    # ==================================================
    # GET HISTORY
    # ==================================================

    readings = get_user_reading_history(user_id)

    # ==================================================
    # NO HISTORY
    # ==================================================

    if not readings:

        st.info(
            "📭 You don't have any readings yet."
        )

        st.write(
            "Complete a Palmistry, Tarot, or Combined reading "
            "to see it here."
        )

        return

    # ==================================================
    # STATISTICS
    # ==================================================

    palm_count = 0
    tarot_count = 0
    combined_count = 0

    for reading in readings:

        reading_type = reading[1]

        if reading_type == "Palmistry":
            palm_count += 1

        elif reading_type == "Tarot":
            tarot_count += 1

        elif reading_type == "Combined":
            combined_count += 1

    # ==================================================
    # SUMMARY
    # ==================================================

    st.subheader("📊 Your Reading Statistics")

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        st.metric(
            "Total Readings",
            len(readings)
        )

    with col2:

        st.metric(
            "🖐️ Palmistry",
            palm_count
        )

    with col3:

        st.metric(
            "🔮 Tarot",
            tarot_count
        )

    with col4:

        st.metric(
            "✨ Combined",
            combined_count
        )

    # ==================================================
    # FILTER
    # ==================================================

    st.divider()

    st.subheader("📖 Your Readings")

    filter_type = st.selectbox(
        "Filter by reading type",
        [
            "All",
            "Palmistry",
            "Tarot",
            "Combined"
        ],
        key="history_filter"
    )

    # ==================================================
    # FILTER READINGS
    # ==================================================

    filtered_readings = []

    for reading in readings:

        reading_type = reading[1]

        if (
            filter_type == "All"
            or reading_type == filter_type
        ):

            filtered_readings.append(
                reading
            )

    # ==================================================
    # DISPLAY READINGS
    # ==================================================

    for reading in filtered_readings:

        reading_id = reading[0]
        reading_type = reading[1]
        question = reading[2]
        cards = reading[3]
        ai_reading = reading[4]
        created_at = reading[5]

        # ----------------------------------------------
        # ICON
        # ----------------------------------------------

        if reading_type == "Palmistry":

            icon = "🖐️"

        elif reading_type == "Tarot":

            icon = "🔮"

        else:

            icon = "✨"

        # ----------------------------------------------
        # TITLE
        # ----------------------------------------------

        st.markdown(
            f"## {icon} {reading_type} Reading"
        )

        st.caption(
            f"Reading ID: {reading_id}  |  "
            f"Date: {created_at}"
        )

        # ----------------------------------------------
        # QUESTION
        # ----------------------------------------------

        if question:

            st.write(
                f"**🎯 Question:** {question}"
            )

        # ----------------------------------------------
        # EXPAND READING
        # ----------------------------------------------

        with st.expander(
            "👁️ View Reading"
        ):

            # ==========================================
            # TAROT / CARDS
            # ==========================================

            if cards:

                st.markdown(
                    "### 🎴 Reading Details"
                )

                try:

                    parsed_cards = json.loads(
                        cards
                    )

                    if isinstance(
                        parsed_cards,
                        list
                    ):

                        positions = [
                            "Past",
                            "Present",
                            "Future"
                        ]

                        for position, item in zip(
                            positions,
                            parsed_cards
                        ):

                            try:

                                card = item["card"]

                                orientation = item[
                                    "orientation"
                                ]

                                st.markdown(
                                    f"**{position}: "
                                    f"{card['name']}**"
                                )

                                st.write(
                                    f"Orientation: "
                                    f"{orientation}"
                                )

                            except Exception:

                                st.write(
                                    str(item)
                                )

                    else:

                        st.write(
                            parsed_cards
                        )

                except Exception:

                    st.write(
                        cards
                    )

            # ==========================================
            # AI READING
            # ==========================================

            if ai_reading:

                st.markdown(
                    "### 🤖 AI Interpretation"
                )

                st.markdown(
                    ai_reading
                )

            else:

                st.info(
                    "No AI interpretation was saved "
                    "for this reading."
                )

        # ----------------------------------------------
        # DOWNLOAD
        # ----------------------------------------------

        download_text = (
            "PALMISTRY & TAROT INTELLIGENCE PLATFORM\n"
            "========================================\n\n"
        )

        download_text += (
            f"Reading Type: {reading_type}\n"
        )

        download_text += (
            f"Date: {created_at}\n"
        )

        if question:

            download_text += (
                f"Question: {question}\n"
            )

        download_text += "\n"

        if cards:

            download_text += (
                "READING DETAILS\n"
                "========================================\n"
            )

            download_text += (
                str(cards)
                + "\n\n"
            )

        if ai_reading:

            download_text += (
                "AI INTERPRETATION\n"
                "========================================\n"
            )

            download_text += (
                ai_reading
                + "\n\n"
            )

        download_text += (
            "DISCLAIMER\n"
            "========================================\n"
            "This reading is intended for reflection "
            "and entertainment only.\n"
        )

        st.download_button(
            "📥 Download Reading",
            data=download_text,
            file_name=(
                f"{reading_type.lower()}_"
                f"reading_{reading_id}.txt"
            ),
            mime="text/plain",
            key=f"download_history_{reading_id}"
        )

        st.divider()