import streamlit as st
from pathlib import Path


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Palmistry & Tarot Intelligence",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent

PALMISTRY_CODE = PROJECT_ROOT / "palmistry" / "code"
INPUT_DIR = PALMISTRY_CODE / "input"

INPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD CSS
# ============================================================

def load_css():

    css_path = PROJECT_ROOT / "style.css"

    if css_path.exists():

        with open(
            css_path,
            "r",
            encoding="utf-8"
        ) as file:

            st.markdown(
                f"<style>{file.read()}</style>",
                unsafe_allow_html=True
            )


load_css()


# ============================================================
# IMPORTS
# ============================================================

from database import (
    initialize_database,
    create_user,
    authenticate_user,
    save_reading,
    get_dashboard_stats,
    get_user_statistics
)


# ============================================================
# INITIALIZE DATABASE
# ============================================================

initialize_database()


# ============================================================
# SESSION STATE
# ============================================================

if "page" not in st.session_state:
    st.session_state["page"] = "home"

if "logged_in" not in st.session_state:
    st.session_state["logged_in"] = False

if "user" not in st.session_state:
    st.session_state["user"] = None

if "reading_history" not in st.session_state:
    st.session_state["reading_history"] = []

if "auth_page" not in st.session_state:
    st.session_state["auth_page"] = "login"


# ============================================================
# HEADER CSS
# ============================================================

st.markdown(
    """
<style>

/* ================================
   GLOBAL THEME
   ================================ */

.stApp {
    background: #0D0B14;
    color: #D8D1E2;
}


/* ================================
   TOP HEADER
   ================================ */

.top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0px 15px 0px;
    border-bottom: 1px solid #292333;
}

.brand-title {
    font-family: Georgia, serif;
    font-size: 28px;
    font-weight: 700;
    color: #E6C98A;
}


/* ================================
   LOGIN
   ================================ */

.login-area {
    text-align: right;
}


/* ================================
   HERO SECTION
   ================================ */

.hero-title {
    font-family: Georgia, serif;
    font-size: 52px;
    font-weight: 700;
    text-align: center;
    color: #E8D9FF;
    margin-top: 30px;
    margin-bottom: 10px;

    /* subtle glow */
    text-shadow: 0px 0px 18px rgba(169, 139, 206, 0.18);
}

.hero-subtitle {
    text-align: center;
    font-size: 20px;
    color: #B9A7D1;
    margin-bottom: 35px;
}


/* ================================
   INTRO TEXT
   ================================ */

.intro-text {
    color: #D8D1E2;
    font-size: 17px;
    line-height: 1.7;
}

.highlight-text {
    color: #E6C98A;
    font-weight: 600;
}


/* ================================
   SECTION HEADINGS
   ================================ */

.section-heading {
    font-family: Georgia, serif;
    font-size: 32px;
    font-weight: 700;
    color: #E6C98A;
    margin-top: 35px;
    margin-bottom: 18px;

    text-shadow: 0px 0px 12px rgba(214, 179, 106, 0.12);
}


/* ================================
   FEATURE CARDS
   ================================ */

.feature-card {
    padding: 22px;
    border-radius: 16px;

    /* dark plum instead of white */
    background: #191522;

    /* subtle lavender border */
    border: 1px solid #3A304A;

    min-height: 180px;

    /* depth */
    box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.25);

    transition: all 0.25s ease;
}


/* Hover effect */

.feature-card:hover {
    border: 1px solid #A98BCE;

    background: #1D1828;

    transform: translateY(-4px);

    box-shadow:
        0px 10px 30px rgba(0, 0, 0, 0.35),
        0px 0px 15px rgba(169, 139, 206, 0.08);
}


/* ================================
   CARD TITLES
   ================================ */

.feature-title {
    font-size: 22px;
    font-weight: 700;
    color: #E6C98A;
}


/* ================================
   CARD TEXT
   ================================ */

.feature-text {
    font-size: 16px;
    line-height: 1.6;
    color: #D8D1E2;
}


/* ================================
   GOLD ACCENTS
   ================================ */

.gold-accent {
    color: #D6B36A;
}

.lavender-accent {
    color: #A98BCE;
}


/* ================================
   BUTTONS
   ================================ */

.stButton > button {
    background: #6F5791;
    color: #FFFFFF;

    border: 1px solid #A98BCE;
    border-radius: 10px;

    font-weight: 600;

    transition: all 0.25s ease;
}

.stButton > button:hover {
    background: #8268A5;
    border-color: #D6B36A;
    color: #FFFFFF;

    box-shadow: 0px 0px 15px rgba(169, 139, 206, 0.25);
}


/* ================================
   LOGIN BUTTON
   ================================ */

.login-area .stButton > button {
    background: #6F5791;
    border: 1px solid #A98BCE;
    color: white;
}


/* ================================
   DIVIDERS
   ================================ */

hr {
    border-color: #292333;
}


/* ================================
   STREAMLIT TEXT
   ================================ */

p {
    color: #D8D1E2;
}

h1, h2, h3 {
    color: #E8D9FF;
}


/* ================================
   SCROLLBAR
   ================================ */

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #0D0B14;
}

::-webkit-scrollbar-thumb {
    background: #3A304A;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: #6F5791;
}

</style>
""",
    unsafe_allow_html=True
)


# ============================================================
# TOP HEADER
# ============================================================

header_col1, header_col2 = st.columns(
    [7, 1],
    vertical_alignment="center"
)

with header_col1:

    st.markdown(
        """
        <div class="brand-title">
            🔮 Palmistry & Tarot Intelligence
        </div>
        """,
        unsafe_allow_html=True
    )


with header_col2:

    if not st.session_state["logged_in"]:

        if st.button(
            "🔐 Login",
            type="primary",
            use_container_width=True
        ):

            st.session_state["auth_page"] = "login"
            st.session_state["page"] = "login"
            st.rerun()

    else:

        if st.button(
            "👤 Account",
            use_container_width=True
        ):

            st.session_state["page"] = "account"
            st.rerun()


st.divider()


# ============================================================
# LOGIN / AUTHENTICATION PAGE
# ============================================================

if (
    not st.session_state["logged_in"]
    and st.session_state["page"] == "login"
):

    st.markdown(
        """
        <div class="hero-title">
            🔐 Welcome Back
        </div>

        <div class="hero-subtitle">
            Sign in to access your Palmistry & Tarot readings.
        </div>
        """,
        unsafe_allow_html=True
    )

    auth_mode = st.radio(
        "Choose an option",
        [
            "Login",
            "Create Account"
        ],
        horizontal=True
    )


    # ========================================================
    # FORGOT PASSWORD
    # ========================================================

    if st.session_state.get("auth_page") == "forgot_password":

        from app_pages import forgot_password

        forgot_password.render()

        st.stop()


    # ========================================================
    # LOGIN
    # ========================================================

    if auth_mode == "Login":

        login_col1, login_col2, login_col3 = st.columns(
            [1, 2, 1]
        )

        with login_col2:

            st.subheader("🔐 Login")

            login_type = st.selectbox(
                "Login as",
                [
                    "User",
                    "Admin"
                ]
            )

            email = st.text_input(
                "Email",
                key="login_email"
            )

            password = st.text_input(
                "Password",
                type="password",
                key="login_password"
            )

            if st.button(
                "🔐 Login",
                type="primary",
                key="login_button"
            ):

                if not email or not password:

                    st.warning(
                        "Please enter your email and password."
                    )

                else:

                    user = authenticate_user(
                        email,
                        password
                    )

                    if user is None:

                        st.error(
                            "Invalid email or password."
                        )

                    elif login_type.lower() != user[3]:

                        st.error(
                            f"This account is registered as "
                            f"{user[3].title()}, not {login_type}."
                        )

                    else:

                        st.session_state["logged_in"] = True

                        st.session_state["user"] = {
                            "id": user[0],
                            "name": user[1],
                            "email": user[2],
                            "role": user[3]
                        }

                        st.session_state["page"] = "home"

                        st.success(
                            f"Welcome, {user[1]}!"
                        )

                        st.rerun()


            st.markdown("")

            if st.button(
                "🔑 Forgot Password?",
                use_container_width=True
            ):

                st.session_state["auth_page"] = "forgot_password"

                st.rerun()


    # ========================================================
    # CREATE ACCOUNT
    # ========================================================

    else:

        register_col1, register_col2, register_col3 = st.columns(
            [1, 2, 1]
        )

        with register_col2:

            st.subheader("📝 Create Account")

            name = st.text_input(
                "Full Name",
                key="register_name"
            )

            email = st.text_input(
                "Email",
                key="register_email"
            )

            password = st.text_input(
                "Password",
                type="password",
                key="register_password"
            )

            confirm_password = st.text_input(
                "Confirm Password",
                type="password",
                key="register_confirm_password"
            )

            if st.button(
                "📝 Create Account",
                type="primary",
                use_container_width=True
            ):

                if not name or not email or not password:

                    st.warning(
                        "Please fill in all fields."
                    )

                elif password != confirm_password:

                    st.error(
                        "Passwords do not match."
                    )

                else:

                    created = create_user(
                        name,
                        email,
                        password
                    )

                    if created:

                        st.success(
                            "Account created successfully! "
                            "You can now login."
                        )

                    else:

                        st.error(
                            "An account with this email already exists."
                        )

    st.stop()


# ============================================================
# PUBLIC HOME PAGE
# ============================================================

if not st.session_state["logged_in"]:

    st.markdown(
        """
        <div class="hero-title">
            🔮 Palmistry & Tarot Intelligence
        </div>

        <div class="hero-subtitle">
            AI-powered Palmistry and Tarot readings for
            <b>reflection, exploration, and self-discovery.</b>
        </div>
        """,
        unsafe_allow_html=True
    )


    st.write(
        """
        ✨ Explore the stories written in your hands and the
        possibilities revealed through Tarot.

        Our AI-powered platform combines palm feature analysis
        with traditional Tarot interpretations to generate
        personalized insights.

        Discover your palm lines, explore card meanings, and
        reflect on different aspects of your journey —
        all in one intelligent platform.
        """
    )


    # ========================================================
    # FEATURE CARDS
    # ========================================================

    st.markdown(
        '<div class="section-heading">✨ Explore the Platform</div>',
        unsafe_allow_html=True
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown(
            """
            <div class="feature-card">

            <div class="feature-title">
                🖐️ Palmistry
            </div>

            <div class="feature-text">
                Analyze major palm lines including the
                Heart Line, Head Line and Life Line using
                computer vision and hand landmark detection.
            </div>

            </div>
            """,
            unsafe_allow_html=True
        )


    with col2:

        st.markdown(
            """
            <div class="feature-card">

            <div class="feature-title">
                🃏 Tarot
            </div>

            <div class="feature-text">
                Explore a three-card Past, Present and Future
                Tarot spread with structured card meanings
                and AI-generated interpretations.
            </div>

            </div>
            """,
            unsafe_allow_html=True
        )


    with col3:

        st.markdown(
            """
            <div class="feature-card">

            <div class="feature-title">
                ✨ Combined Reading
            </div>

            <div class="feature-text">
                Combine Palmistry and Tarot insights into
                a single reflective AI-generated reading.
            </div>

            </div>
            """,
            unsafe_allow_html=True
        )


    # ========================================================
    # PALMISTRY THEORY
    # ========================================================

    st.markdown(
        '<div class="section-heading">🔮 A Journey of Self-Discovery</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        """
        Palmistry and Tarot are two traditional practices that
        have been used as tools for interpretation, reflection,
        and personal exploration.

        While they come from different traditions, both encourage
        people to look more closely at patterns, symbols,
        experiences, and possibilities in their lives.

        Our platform brings these practices together with modern
        Artificial Intelligence, creating an interactive experience
        where traditional interpretations meet computer vision
        and intelligent reading generation.
        """
    )


    st.markdown(
        '<div class="section-heading">✋ Understanding Palmistry</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        """
        Palmistry, also known as chiromancy, is the practice of
        interpreting features of the human hand.

        Traditionally, palmistry examines the shape of the hand,
        fingers, mounts, and major palm lines.

        Commonly interpreted lines include the:

        - **Life Line**
        - **Head Line**
        - **Heart Line**
        - **Fate Line**

        The length, direction, depth and curvature of these lines
        are traditionally associated with different aspects of
        personality and life experiences.

        Our platform uses computer vision and hand landmarks to
        identify structural features before generating an
        interpretation.
        """
    )


    # ========================================================
    # TAROT THEORY
    # ========================================================

    st.markdown(
        '<div class="section-heading">🃏 Understanding Tarot</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        """
        Tarot is a symbolic card system traditionally consisting
        of **78 cards**.

        The deck is divided into:

        **22 Major Arcana cards**

        These represent major themes, archetypes, transitions
        and significant experiences.

        **56 Minor Arcana cards**

        These are divided into four suits:

        - Wands
        - Cups
        - Swords
        - Pentacles

        A Tarot card's interpretation can change depending on
        its position, orientation and surrounding context.
        """
    )


    # ========================================================
    # AI
    # ========================================================

    st.markdown(
        '<div class="section-heading">🤖 Where Tradition Meets AI</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        """
        The distinctive aspect of this platform is the combination
        of traditional interpretive systems with AI-based technology.

        For Palmistry, computer vision can detect the hand and
        extract landmark coordinates. These features help identify
        the structure and location of important palm regions.

        For Tarot, structured card data and traditional meanings
        are used to generate contextual interpretations.

        The purpose is not to claim that AI can predict the future.

        Instead, AI acts as an interactive tool that organizes
        visual features, symbolic information and traditional
        interpretations into a personalized reflective experience.
        """
    )


    # ========================================================
    # DISCLAIMER
    # ========================================================

    st.divider()

    st.info(
        """
        **Disclaimer**

        Palmistry and Tarot readings are intended for reflection,
        exploration and entertainment purposes only.

        They should not be considered scientific predictions,
        medical advice, professional advice or guaranteed
        statements about future events.
        """
    )

    st.stop()


# ============================================================
# LOGGED-IN USER
# ============================================================

user = st.session_state.get("user")

if user is None:

    st.session_state["logged_in"] = False
    st.rerun()


# ============================================================
# SIDEBAR USER INFORMATION
# ============================================================

with st.sidebar:

    st.markdown(
        f"## 👋 Welcome, {user['name']}"
    )

    st.write(
        f"**Email:** {user['email']}"
    )

    st.write(
        f"**Role:** {user['role'].title()}"
    )

    st.divider()


# ============================================================
# ADMIN DASHBOARD
# ============================================================

if user["role"] == "admin":

    st.title("👑 Admin Dashboard")

    st.write(
        "Monitor users and platform activity."
    )

    st.divider()


    # --------------------------------------------------------
    # STATISTICS
    # --------------------------------------------------------

    stats = get_dashboard_stats()

    st.subheader("📊 Platform Statistics")

    col1, col2, col3 = st.columns(3)

    with col1:

        st.metric(
            "👥 Total Users",
            stats["users"]
        )

    with col2:

        st.metric(
            "🔮 Total Readings",
            stats["readings"]
        )

    with col3:

        st.metric(
            "🖐️ Palmistry",
            stats["palmistry"]
        )


    col4, col5 = st.columns(2)

    with col4:

        st.metric(
            "🃏 Tarot",
            stats["tarot"]
        )

    with col5:

        st.metric(
            "✨ Combined",
            stats["combined"]
        )


    # --------------------------------------------------------
    # READING DISTRIBUTION
    # --------------------------------------------------------

    st.divider()

    st.subheader("📊 Reading Type Distribution")

    reading_data = {
        "Palmistry": stats["palmistry"],
        "Tarot": stats["tarot"],
        "Combined": stats["combined"]
    }

    total = sum(
        reading_data.values()
    )

    if total > 0:

        most_used = max(
            reading_data,
            key=reading_data.get
        )

        st.success(
            f"🔥 Most used reading: "
            f"**{most_used}** "
            f"({reading_data[most_used]} readings)"
        )

        st.bar_chart(
            reading_data
        )

    else:

        st.info(
            "No readings have been completed yet."
        )


    # --------------------------------------------------------
    # USERS
    # --------------------------------------------------------

    st.divider()

    st.subheader("👥 User Information")

    users = get_user_statistics()

    if users:

        user_table = []

        for user_data in users:

            user_table.append(
                {
                    "User ID": user_data[0],
                    "Name": user_data[1],
                    "Email": user_data[2],
                    "Joined": user_data[3],
                    "Readings": user_data[4]
                }
            )

        st.dataframe(
            user_table,
            use_container_width=True,
            hide_index=True
        )

    else:

        st.info(
            "No users registered yet."
        )


    # --------------------------------------------------------
    # ADMIN LOGOUT
    # --------------------------------------------------------

    st.divider()

    if st.button(
        "🚪 Logout",
        use_container_width=True
    ):

        st.session_state["logged_in"] = False
        st.session_state["user"] = None
        st.session_state["page"] = "home"

        st.rerun()

    st.stop()


# ============================================================
# USER NAVIGATION
# ============================================================

if user["role"] == "user":

    with st.sidebar:

        st.markdown(
            "## 🧭 Navigation"
        )


        if st.button(
            "🏠 Home",
            use_container_width=True
        ):

            st.session_state["page"] = "home"
            st.rerun()


        if st.button(
            "🖐️ Palmistry",
            use_container_width=True
        ):

            st.session_state["page"] = "palmistry"
            st.rerun()


        if st.button(
            "🔮 Tarot",
            use_container_width=True
        ):

            st.session_state["page"] = "tarot"
            st.rerun()


        if st.button(
            "✨ Combined",
            use_container_width=True
        ):

            st.session_state["page"] = "combined"
            st.rerun()


        if st.button(
            "📜 My Reading History",
            use_container_width=True
        ):

            st.session_state["page"] = "history"
            st.rerun()


        if st.button(
            "🤖 AI Assistant",
            use_container_width=True
        ):

            st.session_state["page"] = "assistant"
            st.rerun()


        if st.button(
            "🔐 Change Password",
            use_container_width=True
        ):

            st.session_state["page"] = "password"
            st.rerun()


        st.divider()


        if st.button(
            "🚪 Logout",
            use_container_width=True
        ):

            st.session_state["logged_in"] = False
            st.session_state["user"] = None
            st.session_state["page"] = "home"

            st.rerun()


# ============================================================
# HOME
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "home"
):

    st.markdown(
        """
        <div class="hero-title">
            🔮 Palmistry & Tarot Intelligence
        </div>

        <div class="hero-subtitle">
            Your personalized space for Palmistry,
            Tarot and AI-assisted reflection.
        </div>
        """,
        unsafe_allow_html=True
    )


    st.success(
        f"Welcome back, **{user['name']}**! 👋"
    )


    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown(
            """
            <div class="feature-card">

            <div class="feature-title">
                🖐️ Palmistry
            </div>

            <div class="feature-text">
                Upload your palm and explore the
                Heart, Head and Life lines.
            </div>

            </div>
            """,
            unsafe_allow_html=True
        )


    with col2:

        st.markdown(
            """
            <div class="feature-card">

            <div class="feature-title">
                🃏 Tarot
            </div>

            <div class="feature-text">
                Draw three cards representing
                Past, Present and Future.
            </div>

            </div>
            """,
            unsafe_allow_html=True
        )


    with col3:

        st.markdown(
            """
            <div class="feature-card">

            <div class="feature-title">
                ✨ Combined
            </div>

            <div class="feature-text">
                Combine Palmistry and Tarot
                into one AI interpretation.
            </div>

            </div>
            """,
            unsafe_allow_html=True
        )


    st.divider()

    st.info(
        "Use the navigation menu on the left to begin a reading."
    )

    st.stop()


# ============================================================
# PALMISTRY PAGE
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "palmistry"
):

    from app_pages import palmistry_page

    palmistry_page.render()

    st.stop()


# ============================================================
# TAROT PAGE
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "tarot"
):

    from app_pages import tarot_page

    tarot_page.render()

    st.stop()


# ============================================================
# COMBINED PAGE
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "combined"
):

    from app_pages import combined_page

    combined_page.render()

    st.stop()


# ============================================================
# HISTORY PAGE
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "history"
):

    from app_pages import reading_history_page

    reading_history_page.render()

    st.stop()


# ============================================================
# AI ASSISTANT
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "assistant"
):

    from app_pages import ai_assistant_page

    ai_assistant_page.render()

    st.stop()


# ============================================================
# CHANGE PASSWORD
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "password"
):

    from app_pages import change_password

    change_password.render()

    st.stop()


# ============================================================
# ACCOUNT PAGE
# ============================================================

if (
    user["role"] == "user"
    and st.session_state["page"] == "account"
):

    st.title("👤 My Account")

    st.subheader("Account Information")

    st.write(
        f"**Name:** {user['name']}"
    )

    st.write(
        f"**Email:** {user['email']}"
    )

    st.write(
        f"**Role:** {user['role'].title()}"
    )

    st.divider()

    if st.button(
        "🔐 Change Password",
        use_container_width=True
    ):

        st.session_state["page"] = "password"

        st.rerun()

    if st.button(
        "🚪 Logout",
        use_container_width=True
    ):

        st.session_state["logged_in"] = False
        st.session_state["user"] = None
        st.session_state["page"] = "home"

        st.rerun()

    st.stop()