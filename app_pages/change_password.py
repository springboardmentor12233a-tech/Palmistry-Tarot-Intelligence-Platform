import streamlit as st

from database import change_password


def render():

    # ======================================
    # 🔐 CHANGE PASSWORD
    # ======================================

    st.title("🔐 Change Password")

    st.write(
        "Update your account password securely."
    )

    # ======================================
    # CHECK LOGIN
    # ======================================

    user = st.session_state.get("user")

    if user is None:

        st.warning(
            "⚠️ Please log in to change your password."
        )

        return

    user_id = user["id"]

    # ======================================
    # PASSWORD FORM
    # ======================================

    with st.form("change_password_form"):

        current_password = st.text_input(
            "Current Password",
            type="password",
            placeholder="Enter your current password"
        )

        new_password = st.text_input(
            "New Password",
            type="password",
            placeholder="Enter your new password"
        )

        confirm_password = st.text_input(
            "Confirm New Password",
            type="password",
            placeholder="Re-enter your new password"
        )

        submitted = st.form_submit_button(
            "🔐 Update Password",
            type="primary"
        )

    # ======================================
    # PROCESS
    # ======================================

    if submitted:

        if not current_password:
            st.error(
                "❌ Please enter your current password."
            )

            return

        if not new_password:
            st.error(
                "❌ Please enter a new password."
            )

            return

        if not confirm_password:
            st.error(
                "❌ Please confirm your new password."
            )

            return

        if new_password != confirm_password:

            st.error(
                "❌ New passwords do not match."
            )

            return

        if current_password == new_password:

            st.error(
                "❌ New password must be different "
                "from your current password."
            )

            return

        # ==================================
        # PASSWORD LENGTH
        # ==================================

        if len(new_password) < 8:

            st.error(
                "❌ New password must contain at least "
                "8 characters."
            )

            return

        # ==================================
        # UPDATE DATABASE
        # ==================================

        success, message = change_password(
            user_id,
            current_password,
            new_password
        )

        if success:

            st.success(
                "✅ Password changed successfully!"
            )

            st.info(
                "You can continue using your account "
                "with your new password."
            )

        else:

            st.error(
                f"❌ {message}"
            )