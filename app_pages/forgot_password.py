import streamlit as st

from database import reset_password


def render():

    # ======================================
    # PAGE HEADER
    # ======================================

    st.title("🔐 Forgot Password")

    st.write(
        "Reset your password using your registered "
        "email address and name."
    )

    st.info(
        "For security, make sure the information "
        "matches your registered account."
    )

    st.divider()

    # ======================================
    # BACK TO LOGIN
    # ======================================

    if st.button(
        "← Back to Login",
        use_container_width=True
    ):

        st.session_state["auth_page"] = "login"

        st.rerun()

    st.divider()

    # ======================================
    # RESET PASSWORD FORM
    # ======================================

    with st.form("forgot_password_form"):

        st.subheader("🔑 Reset Your Password")

        email = st.text_input(
            "📧 Registered Email",
            placeholder="Enter your registered email"
        )

        name = st.text_input(
            "👤 Full Name",
            placeholder="Enter your registered name"
        )

        new_password = st.text_input(
            "🔒 New Password",
            type="password",
            placeholder="Enter your new password"
        )

        confirm_password = st.text_input(
            "🔒 Confirm New Password",
            type="password",
            placeholder="Re-enter your new password"
        )

        reset_button = st.form_submit_button(
            "🔄 Reset Password",
            type="primary",
            use_container_width=True
        )

    # ======================================
    # RESET PASSWORD
    # ======================================

    if reset_button:

        # ==================================
        # VALIDATION
        # ==================================

        if not email.strip():

            st.error(
                "❌ Please enter your registered email."
            )

            return

        if not name.strip():

            st.error(
                "❌ Please enter your registered name."
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

        # ==================================
        # PASSWORD MATCH
        # ==================================

        if new_password != confirm_password:

            st.error(
                "❌ Passwords do not match."
            )

            return

        # ==================================
        # PASSWORD LENGTH
        # ==================================

        if len(new_password) < 6:

            st.error(
                "❌ Password must contain at least "
                "6 characters."
            )

            return

        # ==================================
        # RESET PASSWORD
        # ==================================

        success = reset_password(
            email.strip(),
            name.strip(),
            new_password
        )

        if success:

            st.success(
                "✅ Password reset successfully!"
            )

            st.info(
                "Your password has been changed. "
                "Click below to return to Login."
            )

            if st.button(
                "🔐 Go to Login",
                use_container_width=True
            ):

                st.session_state["auth_page"] = "login"

                st.rerun()

        else:

            st.error(
                "❌ No account found with that "
                "email and name."
            )

            st.warning(
                "Please check your registered "
                "name and email."
            )