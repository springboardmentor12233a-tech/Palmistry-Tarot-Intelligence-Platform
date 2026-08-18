import streamlit as st
import pandas as pd
import plotly.express as px
from pathlib import Path
import sys
import os
from dotenv import load_dotenv

# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env")

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from database import get_all_users, get_all_readings

# ============================================================
# ADMIN AUTHENTICATION
# ============================================================

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

if "admin_logged_in" not in st.session_state:
    st.session_state["admin_logged_in"] = False


if not st.session_state["admin_logged_in"]:

    
    st.markdown(
        """
        <style>

        .admin-login-title {
            text-align: center;
            font-family: Georgia, serif;
            font-size: 2.8rem;
            color: #F3E7C5;
            letter-spacing: 0.08em;
            margin-top: 5rem;
        }

        .admin-login-subtitle {
            text-align: center;
            color: #A8A5C4;
            font-family: Georgia, serif;
            margin-bottom: 2rem;
        }

        </style>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        '<div class="admin-login-title">ADMIN PORTAL</div>',
        unsafe_allow_html=True,
    )

    st.markdown(
        '<div class="admin-login-subtitle">'
        'Authorized access only'
        '</div>',
        unsafe_allow_html=True,
    )

    with st.form("admin_login_form"):

        email = st.text_input(
            "Administrator Email",
            placeholder="Enter administrator email",
        )

        password = st.text_input(
            "Password",
            type="password",
            placeholder="Enter administrator password",
        )

        submitted = st.form_submit_button(
            "LOG IN  →",
            use_container_width=True,
        )

        if submitted:

            if (
                email.strip().lower() == ADMIN_EMAIL.lower()
                and password == ADMIN_PASSWORD
            ):

                st.session_state["admin_logged_in"] = True
                st.rerun()

            else:

                st.error(
                    "Invalid administrator credentials."
                )

    st.stop()

# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="Palmistry Admin Dashboard",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ============================================================
# CUSTOM THEME
# ============================================================

st.markdown(
    """
    <style>

    .stApp {
        background:
            radial-gradient(
                circle at top,
                rgba(58, 40, 91, 0.55),
                rgba(10, 5, 25, 1)
            );
    }

    .dashboard-title {
        font-family: Georgia, serif;
        font-size: 2.8rem;
        font-weight: 600;
        color: #F3E7C5;
        letter-spacing: 0.08em;
        text-align: center;
        margin-bottom: 0.2rem;
    }

    .dashboard-subtitle {
        text-align: center;
        color: #A8A5C4;
        font-family: Georgia, serif;
        font-size: 1.05rem;
        margin-bottom: 2rem;
    }

    .metric-card {
        padding: 1.2rem;
        border-radius: 14px;
        border: 1px solid rgba(198,161,91,0.35);
        background: rgba(30, 20, 48, 0.72);
        text-align: center;
    }

    .metric-label {
        color: #A8A5C4;
        font-size: 0.85rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    .metric-value {
        color: #F3E7C5;
        font-size: 2.1rem;
        font-weight: 600;
        margin-top: 0.3rem;
    }

    .section-title {
        color: #C6A15B;
        font-family: Georgia, serif;
        font-size: 1.25rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }

    </style>
    """,
    unsafe_allow_html=True,
)


# ============================================================
# LOAD DATABASE DATA
# ============================================================

users = get_all_users()
readings = get_all_readings()

users_df = pd.DataFrame(users)
readings_df = pd.DataFrame(readings)

# ============================================================
# FILTERS_START
# ADMIN DASHBOARD FILTERS
# ============================================================

st.markdown("### Dashboard Filters")

filter1, filter2, filter3, filter4 = st.columns([2, 2, 2, 1])

# -------------------------
# Date filter
# -------------------------

with filter1:

    date_options = [
        "All Time",
        "Today",
        "Last 7 Days",
        "Last 30 Days",
    ]

    date_filter = st.selectbox(
        "Date Range",
        date_options,
    )


# -------------------------
# User filter
# -------------------------

with filter2:

    user_options = ["All Users"]

    if not users_df.empty:
        user_options += sorted(
            users_df["name"].dropna().astype(str).unique().tolist()
        )

    selected_user = st.selectbox(
        "User",
        user_options,
    )


# -------------------------
# Tarot spread filter
# -------------------------

with filter3:

    spread_options = [
        "All Spreads",
        "1 Card",
        "2 Cards",
        "3 Cards",
    ]

    selected_spread = st.selectbox(
        "Tarot Spread",
        spread_options,
    )


# -------------------------
# Refresh
# -------------------------

with filter4:

    st.write("")

    if st.button(
        "↻ Refresh",
        use_container_width=True,
    ):
        st.rerun()


# ============================================================
# APPLY FILTERS
# ============================================================

if not users_df.empty:

    users_df["created_at"] = pd.to_datetime(
        users_df["created_at"],
        errors="coerce",
    )

if not readings_df.empty:

    readings_df["created_at"] = pd.to_datetime(
        readings_df["created_at"],
        errors="coerce",
    )


# Date filtering

if date_filter != "All Time":

    today = pd.Timestamp.now().normalize()

    if date_filter == "Today":
        start_date = today

    elif date_filter == "Last 7 Days":
        start_date = today - pd.Timedelta(days=6)

    else:
        start_date = today - pd.Timedelta(days=29)

    if not users_df.empty:
        users_df = users_df[
            users_df["created_at"] >= start_date
        ].copy()

    if not readings_df.empty:
        readings_df = readings_df[
            readings_df["created_at"] >= start_date
        ].copy()


# User filtering

if selected_user != "All Users":

    if not users_df.empty:
        users_df = users_df[
            users_df["name"].astype(str) == selected_user
        ].copy()

    if not readings_df.empty:
        readings_df = readings_df[
            readings_df["name"].astype(str) == selected_user
        ].copy()


# Tarot spread filtering

if selected_spread != "All Spreads":

    spread_number = selected_spread.split()[0]

    if not readings_df.empty:
        readings_df = readings_df[
            readings_df["spread_size"].astype(str)
            == spread_number
        ].copy()


# ============================================================
# FILTERS_END
# ============================================================

# ============================================================
# ADMIN LOGOUT
# ============================================================

logout_col1, logout_col2 = st.columns(
    [8, 1]
)

with logout_col2:

    if st.button("Logout"):

        st.session_state["admin_logged_in"] = False
        st.rerun()

# ============================================================
# HEADER
# ============================================================

st.markdown(
    '<div class="dashboard-title">ADMINISTRATOR DASHBOARD</div>',
    unsafe_allow_html=True,
)

st.markdown(
    '<div class="dashboard-subtitle">'
    'Palmistry Platform · User & Reading Analytics'
    '</div>',
    unsafe_allow_html=True,
)


# ============================================================
# KPI CALCULATIONS
# ============================================================

total_users = len(users_df)

total_readings = len(readings_df)

if total_readings > 0 and "user_id" in readings_df.columns:
    active_users = readings_df["user_id"].nunique()
else:
    active_users = 0

if total_users > 0:
    readings_per_user = total_readings / total_users
else:
    readings_per_user = 0

# Extra period metrics

new_users = total_users
period_readings = total_readings

if date_filter == "All Time":
    period_label = "All Time"
elif date_filter == "Today":
    period_label = "Today"
elif date_filter == "Last 7 Days":
    period_label = "Last 7 Days"
else:
    period_label = "Last 30 Days"


# ------------------------------------------------------------
# ADDITIONAL ADMIN KPIs
# ------------------------------------------------------------

# Number of readings in the currently selected period.
readings_this_period = len(readings_df)


# Classify the questions into broad topics.
topic_keywords_admin = {
    "Career": [
        "career",
        "job",
        "work",
        "profession",
        "business",
    ],
    "Relationships": [
        "love",
        "relationship",
        "marriage",
        "partner",
        "romance",
    ],
    "Finance": [
        "money",
        "finance",
        "financial",
        "wealth",
        "income",
    ],
    "Education": [
        "study",
        "education",
        "college",
        "exam",
        "course",
    ],
    "Future": [
        "future",
        "year ahead",
        "next year",
        "coming",
    ],
    "Personal Growth": [
        "growth",
        "self",
        "purpose",
        "personal",
        "life",
    ],
}


def classify_admin_topic(question):

    question = str(question).lower()

    for topic, keywords in topic_keywords_admin.items():

        for keyword in keywords:

            if keyword in question:
                return topic

    return "Other"


most_asked_topic_admin = "—"

if not readings_df.empty:

    topic_counts_admin = (
        readings_df["question"]
        .fillna("")
        .apply(classify_admin_topic)
        .value_counts()
    )

    if not topic_counts_admin.empty:
        most_asked_topic_admin = topic_counts_admin.index[0]


# ============================================================
# KPI CARDS
# ============================================================

k1, k2, k3, k4, k5, k6 = st.columns(6)


with k1:

    st.markdown(
        f'''
        <div class="metric-card">
            <div class="metric-label">Users</div>
            <div class="metric-value">{total_users}</div>
            <div style="color:#8F8BA8;font-size:0.75rem;">
                {period_label}
            </div>
        </div>
        ''',
        unsafe_allow_html=True,
    )


with k2:

    st.markdown(
        f'''
        <div class="metric-card">
            <div class="metric-label">Readings</div>
            <div class="metric-value">{total_readings}</div>
            <div style="color:#8F8BA8;font-size:0.75rem;">
                {period_label}
            </div>
        </div>
        ''',
        unsafe_allow_html=True,
    )


with k3:

    st.markdown(
        f'''
        <div class="metric-card">
            <div class="metric-label">Active Users</div>
            <div class="metric-value">{active_users}</div>
            <div style="color:#8F8BA8;font-size:0.75rem;">
                Users with readings
            </div>
        </div>
        ''',
        unsafe_allow_html=True,
    )


with k4:

    st.markdown(
        f'''
        <div class="metric-card">
            <div class="metric-label">Readings / User</div>
            <div class="metric-value">{readings_per_user:.2f}</div>
            <div style="color:#8F8BA8;font-size:0.75rem;">
                Average engagement
            </div>
        </div>
        ''',
        unsafe_allow_html=True,
    )


with k5:

    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">Readings This Period</div>
            <div class="metric-value">{readings_this_period}</div>
            <div style="color:#8F8BA8;font-size:0.75rem;">
                {period_label}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


with k6:

    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">Most Asked Topic</div>
            <div class="metric-value"
                 style="font-size:1.15rem;">
                {most_asked_topic_admin}
            </div>
            <div style="color:#8F8BA8;font-size:0.75rem;">
                Based on reading questions
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )



st.markdown("---")


# ============================================================
# USER REGISTRATION TREND
# ============================================================

left, right = st.columns(2)


with left:

    st.markdown(
        '<div class="section-title">User Registration Trend</div>',
        unsafe_allow_html=True,
    )

    if not users_df.empty:

        users_df["created_at"] = pd.to_datetime(
            users_df["created_at"],
            errors="coerce",
        )

        registration_data = (
            users_df
            .dropna(subset=["created_at"])
            .assign(
                date=lambda x: x["created_at"].dt.date
            )
            .groupby("date")
            .size()
            .reset_index(name="users")
        )

        if not registration_data.empty:

            fig_users = px.line(
                registration_data,
                x="date",
                y="users",
                markers=True,
                labels={
                    "date": "Date",
                    "users": "New Users",
                },
                title="New Users Over Time",
            )

            fig_users.update_layout(
                template="plotly_dark",
                height=360,
                margin=dict(
                    l=20,
                    r=20,
                    t=60,
                    b=20,
                ),
            )

            st.plotly_chart(
                fig_users,
                use_container_width=True,
            )

        else:
            st.info("No registration data available.")

    else:
        st.info("No users registered yet.")


# ============================================================
# READING ACTIVITY TREND
# ============================================================

with right:

    st.markdown(
        '<div class="section-title">Reading Activity Trend</div>',
        unsafe_allow_html=True,
    )

    if not readings_df.empty:

        readings_df["created_at"] = pd.to_datetime(
            readings_df["created_at"],
            errors="coerce",
        )

        reading_activity = (
            readings_df
            .dropna(subset=["created_at"])
            .assign(
                date=lambda x: x["created_at"].dt.date
            )
            .groupby("date")
            .size()
            .reset_index(name="readings")
        )

        if not reading_activity.empty:

            fig_readings = px.line(
                reading_activity,
                x="date",
                y="readings",
                markers=True,
                labels={
                    "date": "Date",
                    "readings": "Readings",
                },
                title="Readings Generated Over Time",
            )

            fig_readings.update_layout(
                template="plotly_dark",
                height=360,
                margin=dict(
                    l=20,
                    r=20,
                    t=60,
                    b=20,
                ),
            )

            st.plotly_chart(
                fig_readings,
                use_container_width=True,
            )

        else:
            st.info("No reading activity available.")

    else:
        st.info("No readings generated yet.")


# ============================================================
# TAROT SPREAD + TOPICS
# ============================================================

left, right = st.columns(2)


# ============================================================
# TAROT SPREAD PIE CHART
# ============================================================

with left:

    st.markdown(
        '<div class="section-title">Tarot Spread Distribution</div>',
        unsafe_allow_html=True,
    )

    if not readings_df.empty:

        spread_counts = (
            readings_df["spread_size"]
            .value_counts()
            .sort_index()
            .reset_index()
        )

        spread_counts.columns = [
            "spread_size",
            "count",
        ]

        spread_counts["spread"] = (
            spread_counts["spread_size"]
            .astype(str)
            .map(
                lambda x:
                    "1 Card"
                    if x == "1"
                    else f"{x} Cards"
            )
        )

        fig_spread = px.pie(
            spread_counts,
            names="spread",
            values="count",
            hole=0.38,
            title="Preferred Tarot Spread",
        )

        fig_spread.update_layout(
            template="plotly_dark",
            height=420,
            margin=dict(
                l=20,
                r=20,
                t=60,
                b=20,
            ),
        )

        st.plotly_chart(
            fig_spread,
            use_container_width=True,
        )

    else:
        st.info("No Tarot spread data available yet.")


# ============================================================
# READING TOPIC PIE CHART
# ============================================================

with right:

    st.markdown(
        '<div class="section-title">Reading Topic Distribution</div>',
        unsafe_allow_html=True,
    )

    topic_keywords = {

        "Career": [
            "career",
            "job",
            "work",
            "profession",
            "business",
        ],

        "Relationships": [
            "love",
            "relationship",
            "marriage",
            "partner",
            "romance",
        ],

        "Finance": [
            "money",
            "finance",
            "financial",
            "wealth",
            "income",
        ],

        "Education": [
            "study",
            "education",
            "college",
            "exam",
            "course",
        ],

        "Future": [
            "future",
            "year ahead",
            "next year",
            "coming",
        ],

        "Personal Growth": [
            "growth",
            "self",
            "purpose",
            "personal",
            "life",
        ],
    }


    def classify_topic(question):

        question = str(question).lower()

        for topic, keywords in topic_keywords.items():

            for keyword in keywords:

                if keyword in question:
                    return topic

        return "Other"


    if not readings_df.empty:

        readings_df["topic"] = (
            readings_df["question"]
            .apply(classify_topic)
        )

        topic_counts = (
            readings_df["topic"]
            .value_counts()
            .reset_index()
        )

        topic_counts.columns = [
            "topic",
            "count",
        ]

        fig_topics = px.pie(
            topic_counts,
            names="topic",
            values="count",
            hole=0.38,
            title="What Users Ask About",
        )

        fig_topics.update_layout(
            template="plotly_dark",
            height=420,
            margin=dict(
                l=20,
                r=20,
                t=60,
                b=20,
            ),
        )

        st.plotly_chart(
            fig_topics,
            use_container_width=True,
        )

    else:
        st.info("No reading-topic data available yet.")


# ============================================================
# USER ENGAGEMENT
# ============================================================

st.markdown(
    '<div class="section-title">User Engagement</div>',
    unsafe_allow_html=True,
)

if not readings_df.empty:

    user_activity = (
        readings_df
        .groupby(
            ["user_id", "name"],
            dropna=False,
        )
        .size()
        .reset_index(name="readings")
    )

    user_activity["name"] = (
        user_activity["name"]
        .fillna("Unknown")
    )

    fig_activity = px.bar(
        user_activity.sort_values(
            "readings",
            ascending=False,
        ),
        x="name",
        y="readings",
        labels={
            "name": "User",
            "readings": "Number of Readings",
        },
        title="Readings Generated by User",
    )

    fig_activity.update_layout(
        template="plotly_dark",
        height=420,
        margin=dict(
            l=20,
            r=20,
            t=60,
            b=20,
        ),
    )

    st.plotly_chart(
        fig_activity,
        use_container_width=True,
    )

else:

    st.info("No user activity available yet.")


# ============================================================
# RECENT USERS
# ============================================================

st.markdown(
    '<div class="section-title">Recent Users</div>',
    unsafe_allow_html=True,
)

if not users_df.empty:

    recent_users = users_df.copy()

    recent_users["created_at"] = pd.to_datetime(
        recent_users["created_at"],
        errors="coerce",
    )

    recent_users = (
        recent_users
        .sort_values(
            "created_at",
            ascending=False,
        )
        .head(10)
    )

    recent_users["created_at"] = (
        recent_users["created_at"]
        .dt.strftime(
            "%d %b %Y, %I:%M %p"
        )
    )

    st.dataframe(
        recent_users[
            [
                "id",
                "name",
                "email",
                "created_at",
            ]
        ],
        use_container_width=True,
        hide_index=True,
    )

else:

    st.info("No users available.")


# ============================================================
# RECENT READINGS
# ============================================================

st.markdown(
    '<div class="section-title">Recent Readings</div>',
    unsafe_allow_html=True,
)

if not readings_df.empty:

    recent_readings = readings_df.copy()

    recent_readings["created_at"] = pd.to_datetime(
        recent_readings["created_at"],
        errors="coerce",
    )

    recent_readings = (
        recent_readings
        .sort_values(
            "created_at",
            ascending=False,
        )
        .head(15)
    )

    recent_readings["created_at"] = (
        recent_readings["created_at"]
        .dt.strftime(
            "%d %b %Y, %I:%M %p"
        )
    )

    st.dataframe(
        recent_readings[
            [
                "id",
                "name",
                "email",
                "question",
                "spread_size",
                "created_at",
            ]
        ],
        use_container_width=True,
        hide_index=True,
    )

else:

    st.info("No readings available yet.")


# ============================================================
# FOOTER
# ============================================================

st.markdown("---")

st.caption(
    "Administrator analytics are generated from registered "
    "users and platform reading history."
)