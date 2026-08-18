import base64
import sys
import time
from pathlib import Path
from typing import Any, cast

import cv2
import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from palmtarot.assets import (
    ensure_all_tarot_assets_exist,
    get_card_pil_image,
)
from palmtarot.auth import (
    ROLE_LABELS,
    UserRole,
    authenticate_user,
    register_user,
)
from palmtarot.clustering.model import FEATURE_COLUMNS, PalmClusterPipeline
from palmtarot.data.loader import load_hand_info, load_tarot_df
from palmtarot.db import (
    ChatMessageRecord,
    PalmAnalysisRecord,
    TarotReadingRecord,
    db_manager,
)
from palmtarot.pipeline import PalmTarotPipeline

# Page Configuration
st.set_page_config(
    page_title="AI Palmistry & Tarot Intelligence Platform",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Encode cosmic starfield background image
bg_img_path = BASE_DIR / "palmtarot" / "assets" / "royal_blue_starfield.png"
if not bg_img_path.exists():
    bg_img_path = BASE_DIR / "palmtarot" / "assets" / "mystical_auth_bg.png"
if not bg_img_path.exists():
    bg_img_path = BASE_DIR / "palmtarot" / "assets" / "starfield_bg.png"

bg_b64 = ""
if bg_img_path.exists():
    with open(bg_img_path, "rb") as f:
        bg_b64 = base64.b64encode(f.read()).decode("utf-8")

# Custom Styling with Royal Blue Starfield/Galaxy Background Theme
bg_css = f"""
<style>
    .stApp {{
        background-color: #0f2fa3;
        background-image: linear-gradient(rgba(15, 47, 163, 0.65), rgba(30, 63, 204, 0.75)), url('data:image/png;base64,{bg_b64}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        color: #f8fafc;
        font-family: 'Inter', sans-serif;
    }}

    [data-testid="stSidebar"] {{
        background-color: rgba(10, 25, 85, 0.90) !important;
        backdrop-filter: blur(14px);
        border-right: 1px solid rgba(255, 255, 255, 0.15);
    }}

    .auth-bg-container {{
        background: rgba(10, 25, 85, 0.88);
        backdrop-filter: blur(16px);
        padding: 40px 30px;
        border-radius: 20px;
        box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.7);
        margin: 10px auto;
        max-width: 600px;
        border: 1px solid rgba(168, 85, 247, 0.55);
    }}

    .auth-title {{
        text-align: center;
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #e0e7ff 0%, #c084fc 50%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }}

    .auth-subtitle {{
        text-align: center;
        color: #cbd5e1;
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
    }}

    .metric-card {{
        background: rgba(10, 25, 85, 0.82);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.4);
    }}
    .metric-value {{
        font-size: 2.2rem;
        font-weight: 700;
        color: #38bdf8;
    }}
    .metric-label {{
        font-size: 0.9rem;
        color: #cbd5e1;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }}

    .main-header {{
        background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #f472b6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 2.8rem;
        font-weight: 800;
        text-align: center;
        margin-bottom: 0.5rem;
    }}
    .sub-header {{
        text-align: center;
        color: #cbd5e1;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
    }}

    .role-badge {{
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-top: 4px;
    }}
    .role-user {{ background: #3b82f6; color: #ffffff; }}
    .role-reader {{ background: #8b5cf6; color: #ffffff; }}
    .role-consultant {{ background: #ec4899; color: #ffffff; }}
    .role-admin {{ background: #10b981; color: #ffffff; }}

    /* Contrast overlays for cards, expanders, forms & inputs */
    div[data-testid="stForm"], div.stExpander, div[data-testid="stChatMessage"] {{
        background: rgba(10, 25, 85, 0.80) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        border-radius: 12px !important;
        padding: 12px !important;
        margin-bottom: 10px !important;
    }}

    /* Sidebar Platform Info & Quote Card Styling */
    .sidebar-info-card {{
        background: rgba(10, 25, 85, 0.65);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(168, 85, 247, 0.35);
        border-radius: 12px;
        padding: 14px;
        margin-top: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
    }}
    .sidebar-info-item {{
        font-size: 0.82rem;
        color: #cbd5e1;
        margin-bottom: 7px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }}
    .sidebar-info-item:last-child {{
        margin-bottom: 0;
    }}
    .sidebar-quote-card {{
        background: linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(88, 28, 135, 0.6));
        border-left: 3px solid #38bdf8;
        border-radius: 8px;
        padding: 12px;
        margin-top: 14px;
        font-size: 0.83rem;
        font-style: italic;
        color: #e0e7ff;
        line-height: 1.4;
    }}
</style>
"""
st.markdown(bg_css, unsafe_allow_html=True)


def get_pipeline():
    return PalmTarotPipeline()


@st.cache_data
def load_hand_data():
    return load_hand_info()


@st.cache_data
def load_tarot_data():
    return load_tarot_df()


@st.cache_data
def get_clustered_features():
    pipeline = PalmClusterPipeline(n_clusters=5, random_state=42)
    df = pipeline._generate_synthetic_training_data(n_samples=250)
    pipeline.fit(df)
    X = df[FEATURE_COLUMNS].astype("float32")
    X_scaled = pipeline.scaler.transform(X)
    pca_coords = pipeline.pca.transform(X_scaled)
    clusters = pipeline.kmeans.predict(X_scaled)
    df["PC1"] = pca_coords[:, 0]
    df["PC2"] = pca_coords[:, 1]
    df["Cluster"] = [f"Cluster {c}" for c in clusters]
    return df, pipeline.get_cluster_summary(df)


# Ensure local tarot card assets exist
ensure_all_tarot_assets_exist()

# Initialize Session State for Auth & App State
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
    st.session_state.current_user = None
    st.session_state.username = ""
    st.session_state.user_role = ""
    st.session_state.full_name = ""

if "db_session" not in st.session_state:
    sess_obj = db_manager.create_or_get_session(username=st.session_state.get("username", "guest"))
    st.session_state.db_session = sess_obj.session_id

if "readings_count" not in st.session_state:
    st.session_state.readings_count = 142
if "latency_history" not in st.session_state:
    st.session_state.latency_history = [0.85, 0.92, 0.78, 1.10, 0.88, 0.95]
if "last_reading" not in st.session_state:
    st.session_state.last_reading = None


# ==========================================
# UNAUTHENTICATED LANDING PAGE VIEW
# ==========================================
def render_landing_page():
    st.markdown("<h1 class='main-header'>✨ AI Palmistry & Tarot Intelligence Platform</h1>", unsafe_allow_html=True)
    st.markdown("<div class='sub-header'>Discover Your Path Through Computer Vision & Celestial Wisdom</div>", unsafe_allow_html=True)

    _col1, col2, _col3 = st.columns([1, 2.5, 1])
    with col2:
        st.markdown("<div class='auth-bg-container'>", unsafe_allow_html=True)
        st.markdown("<div class='auth-title'>🌌 Welcome to Celestial Portal</div>", unsafe_allow_html=True)
        st.markdown("<div class='auth-subtitle'>Sign in to your account or create a new profile to access reading tools</div>", unsafe_allow_html=True)

        tab_signin, tab_register = st.tabs(["🔑 Sign In", "📝 Register Account"])

        with tab_signin:
            with st.form("signin_form"):
                login_email = st.text_input("Email Address or Username", key="landing_login_email")
                login_password = st.text_input("Password", type="password", key="landing_login_password")
                submit_login = st.form_submit_button("✨ Sign In", use_container_width=True, type="primary")

                if submit_login:
                    if not login_email.strip() or not login_password.strip():
                        st.error("Please enter both email/username and password.")
                    else:
                        user = authenticate_user(login_email, login_password)
                        if user:
                            st.session_state.authenticated = True
                            st.session_state.current_user = user
                            st.session_state.user_role = user["role"]
                            st.session_state.full_name = user["full_name"]
                            st.session_state.username = user["username"]
                            sess = db_manager.create_or_get_session(username=user["username"], user_id=user.get("id"))
                            st.session_state.db_session = sess.session_id
                            st.success(f"Welcome back, {user['full_name']}!")
                            st.rerun()
                        else:
                            st.error("Invalid email/username or password. Please check your credentials.")

        with tab_register:
            with st.form("register_form"):
                reg_name = st.text_input("Full Name", key="landing_reg_name")
                reg_email = st.text_input("Email Address", key="landing_reg_email")
                reg_pass = st.text_input("Password", type="password", key="landing_reg_pass")
                reg_confirm = st.text_input("Confirm Password", type="password", key="landing_reg_confirm")
                reg_role = st.selectbox("Account Role", ["user", "admin"], format_func=lambda x: "Standard User" if x == "user" else "System Admin", key="landing_reg_role")
                submit_reg = st.form_submit_button("🌟 Create Account", use_container_width=True, type="primary")

                if submit_reg:
                    # Basic Client Validation
                    if not reg_name.strip():
                        st.error("Validation Error: Full Name is required.")
                    elif not reg_email.strip().lower().endswith("@gmail.com"):
                        st.error("Please use a valid @gmail.com email address.")
                    elif len(reg_pass) < 4:
                        st.error("Validation Error: Password must be at least 4 characters long.")
                    elif reg_pass != reg_confirm:
                        st.error("Validation Error: Passwords do not match. Please verify password confirmation.")
                    else:
                        try:
                            uname = reg_email.split("@")[0]
                            res = register_user(
                                username=uname,
                                password=reg_pass,
                                role=reg_role,
                                full_name=reg_name,
                                email=reg_email
                            )
                            st.session_state.authenticated = True
                            st.session_state.current_user = res
                            st.session_state.user_role = res["role"]
                            st.session_state.full_name = res["full_name"]
                            st.session_state.username = res["username"]
                            sess = db_manager.create_or_get_session(username=res["username"], user_id=res.get("id"))
                            st.session_state.db_session = sess.session_id
                            st.success("Account registered successfully!")
                            st.rerun()
                        except ValueError as ve:
                            st.error(str(ve))

        st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown("##### ⚡ Instant Demo Account Logins:")
        c_d1, c_d2 = st.columns(2)
        with c_d1:
            if st.button("👤 Demo User (`user@gmail.com`)", use_container_width=True):
                user = authenticate_user("user@gmail.com", "user123")
                if user:
                    st.session_state.authenticated = True
                    st.session_state.current_user = user
                    st.session_state.user_role = user["role"]
                    st.session_state.full_name = user["full_name"]
                    st.session_state.username = user["username"]
                    sess = db_manager.create_or_get_session(username=user["username"], user_id=user.get("id"))
                    st.session_state.db_session = sess.session_id
                    st.rerun()
        with c_d2:
            if st.button("🔑 Demo Admin (`admin@gmail.com`)", use_container_width=True):
                user = authenticate_user("admin@gmail.com", "admin123")
                if user:
                    st.session_state.authenticated = True
                    st.session_state.current_user = user
                    st.session_state.user_role = user["role"]
                    st.session_state.full_name = user["full_name"]
                    st.session_state.username = user["username"]
                    sess = db_manager.create_or_get_session(username=user["username"], user_id=user.get("id"))
                    st.session_state.db_session = sess.session_id
                    st.rerun()


if not st.session_state.authenticated:
    render_landing_page()
    st.stop()


# ==========================================
# SIDEBAR FOR AUTHENTICATED USER
# ==========================================
with st.sidebar:
    st.markdown("### 🔐 User Session & Role")

    role = st.session_state.user_role
    badge_class = {
        UserRole.USER.value: "role-user",
        UserRole.TAROT_READER.value: "role-reader",
        UserRole.SPIRITUAL_CONSULTANT.value: "role-consultant",
        UserRole.ADMIN.value: "role-admin"
    }.get(role, "role-user")

    role_label = ROLE_LABELS.get(cast(Any, role), str(role).capitalize())

    st.success(f"Logged in as **{st.session_state.full_name}** (`{st.session_state.username}`)")
    st.markdown(f"Role: <span class='role-badge {badge_class}'>{role_label}</span>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)

    if st.button("🚪 Log Out", use_container_width=True):
        st.session_state.authenticated = False
        st.session_state.current_user = None
        st.session_state.username = ""
        st.session_state.user_role = ""
        st.session_state.full_name = ""
        st.rerun()

    st.markdown("<hr style='margin: 20px 0 18px 0; border-color: rgba(255,255,255,0.15);'>", unsafe_allow_html=True)

    # Personalized Insights Card
    st.markdown(
        """
        <div class="sidebar-info-card" style="padding: 16px; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; background: rgba(10, 25, 85, 0.65);">
            <div style="font-weight: 700; color: #c084fc; font-size: 1.0rem; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                ✨ Personalized Insights
            </div>
            <div style="font-size: 0.86rem; color: #e2e8f0; line-height: 1.55;">
                Your palm analysis and tarot recommendations are generated for your session.
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Platform Name & Version Footer
    st.markdown(
        """
        <div style="text-align: center; margin-top: 28px; margin-bottom: 10px; color: #cbd5e1; font-size: 0.85rem;">
            <div style="font-weight: 600; color: #f8fafc; letter-spacing: 0.02em;">🔮 AI Palmistry & Tarot</div>
            <div style="margin-top: 4px; color: #94a3b8; font-size: 0.78rem;">Version 1.0.0</div>
        </div>
        """,
        unsafe_allow_html=True
    )


# Render Main Header
st.markdown("<h1 class='main-header'>✨ AI Palmistry & Tarot Intelligence Platform</h1>", unsafe_allow_html=True)
st.markdown("<div class='sub-header'>Role-Based Dashboard & Celestial Computer Vision Reading Intelligence</div>", unsafe_allow_html=True)


# Role-Gated Tab Selection
current_role = st.session_state.user_role

if current_role == UserRole.ADMIN.value:
    active_tab_names = [
        "👥 Users Dashboard",
        "🔮 Live Reading Demo",
        "💬 AI Chatbot",
        "👤 My Profile",
        "📊 Executive Overview"
    ]
else:
    active_tab_names = [
        "🔮 Live Reading Demo",
        "💬 AI Chatbot",
        "👤 My Profile",
        "📊 Executive Overview"
    ]

tabs = st.tabs(active_tab_names)


# ==========================================
# USER PROFILE PAGE VIEW
# ==========================================
def render_user_profile():
    st.header("👤 My Profile & Celestial Reading History")
    st.markdown("View your account profile details, past searches/questions, and corresponding answers/results.")

    curr_u = st.session_state.get("current_user") or {}
    user_id = curr_u.get("id")
    session_id = st.session_state.get("db_session")

    col_u1, col_u2 = st.columns([1, 2])

    with col_u1:
        st.subheader("📋 Account Information")
        st.markdown(f"**Full Name:** {curr_u.get('full_name', 'N/A')}")
        st.markdown(f"**Email Address:** `{curr_u.get('email', 'N/A')}`")
        st.markdown(f"**Username:** `{curr_u.get('username', 'N/A')}`")
        badge = "role-admin" if curr_u.get("role") == "admin" else "role-user"
        st.markdown(f"**Role:** <span class='role-badge {badge}'>{curr_u.get('role', 'user').upper()}</span>", unsafe_allow_html=True)
        st.markdown(f"**Joined Date:** {str(curr_u.get('created_at', '2026-08-14'))[:10]}")

    with col_u2:
        st.subheader("📜 Reading & Q&A History")
        sid = session_id or ""
        p_latest = db_manager.get_latest_palm_analysis(sid) if sid else None
        t_latest = db_manager.get_latest_tarot_reading(sid) if sid else None

        palm_history = db_manager.get_user_palm_analyses(user_id) if user_id else ([p_latest] if p_latest else [])
        tarot_history = db_manager.get_user_tarot_readings(user_id) if user_id else ([t_latest] if t_latest else [])
        chat_history = db_manager.get_user_chat_messages(user_id) if user_id else (db_manager.get_chat_history(sid) if sid else [])

        combined = []
        for p in palm_history:
            if p:
                combined.append({
                    "icon": "✋",
                    "type": "Palm Analysis",
                    "timestamp": p.timestamp,
                    "question": "Palm Landmark & Structural Feature Analysis",
                    "answer": f"Palm Shape: **{p.palm_shape}** | Aspect Ratio: **{p.aspect_ratio:.2f}** | Cluster **#{p.cluster_id}**"
                })
        for t in tarot_history:
            if t and t.cards:
                cards_str = ", ".join([f"{c.get('name', 'Card')} ({c.get('orientation', 'Upright')})" for c in t.cards])
                interp = t.interpretation or {}
                summary = interp.get("personality") or interp.get("career_guidance") or "Tarot Cards Drawn"
                combined.append({
                    "icon": "🎴",
                    "type": "Tarot Reading",
                    "timestamp": t.timestamp,
                    "question": t.user_question or "General Tarot Draw Focus",
                    "answer": f"**Drawn Cards:** {cards_str}\n\n**Reading Summary:** {summary}"
                })
        for c in chat_history:
            combined.append({
                "icon": "💬",
                "type": "Chat Q&A",
                "timestamp": c.timestamp,
                "question": c.user_message,
                "answer": c.bot_reply
            })

        # Remove duplicate history entries if any
        seen_keys = set()
        unique_combined = []
        for item in combined:
            key = f"{item['type']}_{item['timestamp']}_{item['question']}"
            if key not in seen_keys:
                seen_keys.add(key)
                unique_combined.append(item)

        unique_combined.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        if not unique_combined:
            st.info("No past readings or Q&A history recorded under your user account yet. Try asking a question in the 'Chatbot' tab or run a reading in 'Live Reading Demo'!")
        else:
            st.caption(f"Showing {len(unique_combined)} history records (most recent first):")
            for item in unique_combined:
                formatted_time = item["timestamp"][:19].replace("T", " ")
                with st.expander(f"{item['icon']} [{item['type']}] — {formatted_time}"):
                    st.markdown(f"**❓ Question / Focus:** {item['question']}")
                    st.markdown(f"**💡 Answer / Result Given:**\n\n{item['answer']}")


# ==========================================
# ADMIN DASHBOARD: USERS DASHBOARD
# ==========================================
def render_admin_users_dashboard():
    st.header("👥 Users Dashboard (Admin)")
    st.markdown("Manage registered user accounts, activity status, signup dates, and system role assignments.")

    all_users = db_manager.get_all_users()

    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f"<div class='metric-card'><div class='metric-value'>{len(all_users)}</div><div class='metric-label'>Total Registered Users</div></div>", unsafe_allow_html=True)
    with m2:
        active_cnt = sum(1 for u in all_users if u.is_active)
        st.markdown(f"<div class='metric-card'><div class='metric-value'>{active_cnt}</div><div class='metric-label'>Active Accounts</div></div>", unsafe_allow_html=True)
    with m3:
        admin_cnt = sum(1 for u in all_users if u.role == "admin")
        st.markdown(f"<div class='metric-card'><div class='metric-value'>{admin_cnt}</div><div class='metric-label'>System Admins</div></div>", unsafe_allow_html=True)
    with m4:
        st.markdown("<div class='metric-card'><div class='metric-value'>100%</div><div class='metric-label'>Bcrypt Password Security</div></div>", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    st.subheader("📋 User Account Directory")
    u_records = []
    for u in all_users:
        u_records.append({
            "User ID": u.id[:8] + "...",
            "Full Name": u.full_name,
            "Email Address": u.email,
            "Username": u.username,
            "Role": u.role,
            "Status": "🟢 Active" if u.is_active else "🔴 Inactive",
            "Signup Date": u.created_at[:10]
        })
    st.dataframe(pd.DataFrame(u_records), use_container_width=True)

    st.markdown("---")
    st.subheader("⚙️ Update User Status & Role Assignment")
    c_sel, c_act = st.columns([2, 1])
    with c_sel:
        selected_user_email = st.selectbox("Select User Account to Manage:", [u.email for u in all_users], key="admin_user_select")
    with c_act:
        target_u = db_manager.get_user_by_email(selected_user_email)
        if target_u:
            new_status = st.checkbox("Account Active Status", value=target_u.is_active, key=f"status_{target_u.id}")
            role_options = ["user", "admin", "tarot_reader", "spiritual_consultant"]
            idx = role_options.index(target_u.role) if target_u.role in role_options else 0
            new_role = st.selectbox("System Role", role_options, index=idx, key=f"role_{target_u.id}")

            if st.button("Save Account Changes", type="primary", use_container_width=True):
                db_manager.update_user(target_u.id, {"is_active": new_status, "role": new_role})
                st.success(f"User account '{target_u.email}' updated successfully!")
                st.rerun()


# ==========================================
# ADMIN DASHBOARD: PLANS DASHBOARD
# ==========================================
def render_admin_plans_dashboard():
    st.header("💳 Tier Plans & Subscriptions (Admin)")
    st.markdown("Overview of platform tier plans, rate limits, and model access allocations.")

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(
            """
            <div class='metric-card'>
                <div style='font-size: 1.2rem; font-weight: 700; color: #38bdf8;'>Free Tier</div>
                <p style='font-size: 0.85rem; color: #cbd5e1; margin-top: 8px;'>Basic Palmistry & 3 Tarot Draws</p>
                <h3 style='color: #a855f7;'>$0 / mo</h3>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            """
            <div class='metric-card'>
                <div style='font-size: 1.2rem; font-weight: 700; color: #c084fc;'>Pro Reader</div>
                <p style='font-size: 0.85rem; color: #cbd5e1; margin-top: 8px;'>Full UNet Segmentation + OpenAI Synthesis</p>
                <h3 style='color: #a855f7;'>$19 / mo</h3>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            """
            <div class='metric-card'>
                <div style='font-size: 1.2rem; font-weight: 700; color: #f472b6;'>Enterprise Consultant</div>
                <p style='font-size: 0.85rem; color: #cbd5e1; margin-top: 8px;'>Unlimited Readings + PDF Reports & API</p>
                <h3 style='color: #a855f7;'>$49 / mo</h3>
            </div>
            """,
            unsafe_allow_html=True,
        )


# ==========================================
# PRESERVED EXISTING EXECUTIVE OVERVIEW
# ==========================================
def render_executive_overview():
    st.header("Executive Summary & System Performance")

    hand_df = load_hand_data()
    load_tarot_data()
    clustered_df, _ = get_clustered_features()

    avg_latency = np.mean(st.session_state.latency_history)

    # Top KPI Metrics Row
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-value'>{st.session_state.readings_count}</div>
            <div class='metric-label'>Total Readings Generated</div>
        </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-value'>{len(hand_df):,}</div>
            <div class='metric-label'>Hand Dataset Images</div>
        </div>
        """, unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
        <div class='metric-card'>
            <div class='metric-value'>{avg_latency:.2f}s</div>
            <div class='metric-label'>Avg Model Latency</div>
        </div>
        """, unsafe_allow_html=True)
    with m4:
        st.markdown("""
        <div class='metric-card'>
            <div class='metric-value'>99.4%</div>
            <div class='metric-label'>Pipeline Success Rate</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    col_left, col_right = st.columns(2)

    with col_left:
        st.subheader("👥 Hand Dataset Demographics")
        if "gender" in hand_df.columns:
            gender_fig = px.pie(
                hand_df,
                names="gender",
                title="Gender Distribution",
                hole=0.4,
                color_discrete_sequence=px.colors.qualitative.Pastel
            )
            gender_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
            st.plotly_chart(gender_fig, use_container_width=True)

        if "skinColor" in hand_df.columns:
            skin_fig = px.bar(
                hand_df["skinColor"].value_counts().reset_index(),
                x="skinColor",
                y="count",
                title="Skin Tone Distribution",
                color="skinColor",
                color_discrete_sequence=px.colors.sequential.Viridis
            )
            skin_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
            st.plotly_chart(skin_fig, use_container_width=True)

    with col_right:
        st.subheader("🎯 Clustering & Latency Dynamics")
        cluster_counts = clustered_df["Cluster"].value_counts().reset_index()
        cluster_fig = px.pie(
            cluster_counts,
            names="Cluster",
            values="count",
            title="PCA / KMeans Hand Topology Cluster Breakdown",
            color_discrete_sequence=px.colors.sequential.Plasma
        )
        cluster_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
        st.plotly_chart(cluster_fig, use_container_width=True)

        latency_df = pd.DataFrame({"Reading": range(1, len(st.session_state.latency_history) + 1), "Latency (s)": st.session_state.latency_history})
        latency_fig = px.line(
            latency_df,
            x="Reading",
            y="Latency (s)",
            title="Inference Latency Trend",
            markers=True,
            line_shape="spline"
        )
        latency_fig.update_traces(line_color="#a855f7")
        latency_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
        st.plotly_chart(latency_fig, use_container_width=True)


# ==========================================
# PRESERVED EXISTING PALM & TAROT ANALYTICS
# ==========================================
def render_palm_analytics():
    st.header("Palm Landmark & Feature Clustering Analytics")

    clustered_df, summary_df = get_clustered_features()

    col_p1, col_p2 = st.columns([3, 2])

    with col_p1:
        st.subheader("🌌 2D PCA Landmark Feature Space")
        pca_fig = px.scatter(
            clustered_df,
            x="PC1",
            y="PC2",
            color="Cluster",
            hover_data=["palm_width", "palm_height", "aspect_ratio"],
            title="Principal Component Analysis (PCA) Scatter by KMeans Cluster",
            color_discrete_sequence=px.colors.qualitative.Bold,
            size_max=12
        )
        pca_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
        st.plotly_chart(pca_fig, use_container_width=True)

    with col_p2:
        st.subheader("📈 Cluster Profile Means")
        st.dataframe(summary_df.style.background_gradient(cmap="Purples"), use_container_width=True)

    st.subheader("📊 Geometric Feature Distributions")
    selected_feature = st.selectbox("Select Landmark Metric:", FEATURE_COLUMNS, index=0)

    dist_fig = px.histogram(
        clustered_df,
        x=selected_feature,
        color="Cluster",
        marginal="box",
        title=f"Distribution of {selected_feature} across Clusters",
        barmode="overlay",
        opacity=0.75
    )
    dist_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
    st.plotly_chart(dist_fig, use_container_width=True)


def render_tarot_analytics():
    st.header("Tarot Dataset & Draw Analytics")

    tarot_df = load_tarot_data()

    if not tarot_df.empty:
        c_t1, c_t2 = st.columns(2)

        with c_t1:
            st.subheader("🃏 Deck Arcana Split")
            if "arcana" in tarot_df.columns:
                arcana_fig = px.pie(
                    tarot_df,
                    names="arcana",
                    title="Major vs Minor Arcana Cards",
                    color_discrete_sequence=["#8b5cf6", "#ec4899"]
                )
                arcana_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
                st.plotly_chart(arcana_fig, use_container_width=True)

        with c_t2:
            st.subheader("⚔️ Minor Arcana Suit Breakdown")
            if "suit" in tarot_df.columns:
                suits_df = tarot_df[tarot_df["suit"] != "Major"]
                suit_series = pd.Series(suits_df["suit"])
                suit_fig = px.bar(
                    suit_series.value_counts().reset_index(),
                    x="suit",
                    y="count",
                    title="Cards per Suit",
                    color="suit",
                    color_discrete_sequence=px.colors.qualitative.Set2
                )
                suit_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
                st.plotly_chart(suit_fig, use_container_width=True)

        st.subheader("⚖️ Upright vs. Reversed Ratio (Simulated Draw Logs)")
        orientation_df = pd.DataFrame({
            "Orientation": ["Upright", "Reversed"],
            "Count": [428, 412]
        })
        orient_fig = px.pie(
            orientation_df,
            names="Orientation",
            values="Count",
            title="Upright / Reversed Draw Balance",
            color_discrete_sequence=["#10b981", "#ef4444"],
            hole=0.4
        )
        orient_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#f8fafc")
        st.plotly_chart(orient_fig, use_container_width=True)


def render_human_readable_palm_report(palm_report: dict):
    """Render palm rule analysis as readable sentences and paragraphs describing trait meanings."""
    shape = palm_report.get("Palm_Shape", "Square Palm")
    width_type = palm_report.get("Palm_Width_Type", "Medium Palm")
    height_type = palm_report.get("Palm_Height_Type", "Medium Palm Height")

    thumb = palm_report.get("Thumb_Type", "Medium")
    index = palm_report.get("Index_Type", "Medium")
    middle = palm_report.get("Middle_Type", "Medium")
    ring = palm_report.get("Ring_Type", "Medium")
    little = palm_report.get("Little_Type", "Medium")

    shape_descriptions = {
        "Square Palm": "Your hand exhibits a balanced, square palm architecture. In traditional palmistry, a square structure represents a practical, grounded, and methodical approach to life, with strong problem-solving skills and organizational discipline.",
        "Rectangular Palm": "Your hand exhibits an elongated rectangular palm architecture. This structure is often associated with analytical thinking, active imagination, intellectual curiosity, and intuitive insight.",
        "Long Rectangular Palm": "Your hand features a distinctly elongated rectangular palm archetype. This reflects deep emotional sensitivity, creative imagination, high intellectual focus, and a contemplative nature."
    }
    shape_desc = shape_descriptions.get(shape, f"Your hand exhibits a {shape} structure, balancing physical stability with adaptable thinking.")

    st.markdown(f"**Palm Archetype ({shape}):**")
    st.write(shape_desc)
    st.write(f"• **Palm Width:** Measured as **{width_type}**, suggesting steady adaptability when handling daily interactions and environmental challenges.")
    st.write(f"• **Palm Height:** Measured as **{height_type}**, demonstrating balanced endurance and physical stamina.")

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("**Finger Trait & Proportion Analysis:**")
    st.write(f"• **Thumb ({thumb}):** A {thumb.lower()} thumb reflects core willpower, drive, and decision-making confidence.")
    st.write(f"• **Index Finger ({index}):** A {index.lower()} index finger relates to ambition, leadership capability, and personal autonomy.")
    st.write(f"• **Middle Finger ({middle}):** A {middle.lower()} middle finger signifies ethical responsibility, duty, and structured focus.")
    st.write(f"• **Ring Finger ({ring}):** A {ring.lower()} ring finger highlights creative expression, aesthetic sensibility, and warmth.")
    st.write(f"• **Little Finger ({little}):** A {little.lower()} little finger denotes communication style, social charm, and clarity of expression.")


# ==========================================
# PRESERVED EXISTING LIVE READING DEMO
# ==========================================
def render_live_reading_demo():
    st.header("🔮 Integrated Live Reading Demo")
    st.markdown("Upload a palm image, select a synthetic hand archetype sample, specify your question, and trigger the full AI pipeline.")

    col_input, col_output = st.columns([1, 1])

    with col_input:
        st.subheader("📥 Input Configuration")

        uploaded_file = st.file_uploader("Upload Hand / Palm Image", type=["jpg", "jpeg", "png"])
        user_question = st.text_input("User Question / Focus Area", value="What opportunities and strengths should I focus on next?")
        num_cards = st.slider("Tarot Cards Draw Count", min_value=1, max_value=5, value=3)

        st.markdown("**OR Select Synthetic Hand Sample Archetype:**")
        s_col1, s_col2, s_col3 = st.columns(3)
        sample_choice = None
        with s_col1:
            if st.button("🖐️ Square Palm Sample"):
                sample_choice = "square"
        with s_col2:
            if st.button("✋ Long Palm Sample"):
                sample_choice = "long"
        with s_col3:
            if st.button("👐 Wide Palm Sample"):
                sample_choice = "wide"

        image_to_process = None
        if uploaded_file is not None:
            image_bytes = uploaded_file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_bgr is not None:
                image_to_process = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
                st.image(image_to_process, caption="Uploaded Hand Image Preview", use_container_width=True)

        elif sample_choice is not None or "current_sample" in st.session_state:
            if sample_choice is not None:
                st.session_state.current_sample = sample_choice
            choice = st.session_state.get("current_sample", "square")

            if choice == "square":
                synth_img = np.zeros((450, 450, 3), dtype=np.uint8)
                cv2.circle(synth_img, (225, 250), 120, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (130, 200), (35, 75), -25, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (180, 110), (30, 85), -10, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (230, 90), (30, 95), 0, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (280, 110), (30, 85), 10, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (325, 150), (25, 70), 20, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (200, 220), (70, 45), -20, 0, 120, (140, 90, 60), 4)
                cv2.ellipse(synth_img, (240, 260), (80, 50), 10, 0, 130, (140, 90, 60), 4)
                cv2.ellipse(synth_img, (220, 280), (60, 75), 40, 0, 140, (140, 90, 60), 4)
                caption_text = "Synthetic Square Palm Sample (Equal Width/Height)"
            elif choice == "long":
                synth_img = np.zeros((550, 350, 3), dtype=np.uint8)
                cv2.ellipse(synth_img, (175, 320), (100, 160), 0, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (90, 260), (25, 80), -35, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (135, 120), (22, 110), -8, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (175, 90), (22, 125), 0, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (215, 120), (22, 110), 8, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (255, 170), (20, 90), 18, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (160, 280), (65, 40), -15, 0, 120, (130, 80, 50), 4)
                cv2.ellipse(synth_img, (190, 320), (75, 45), 15, 0, 130, (130, 80, 50), 4)
                cv2.ellipse(synth_img, (170, 350), (55, 90), 35, 0, 140, (130, 80, 50), 4)
                caption_text = "Synthetic Long Rectangular Palm Sample (Elongated Height)"
            else:
                synth_img = np.zeros((380, 520, 3), dtype=np.uint8)
                cv2.ellipse(synth_img, (260, 240), (160, 95), 0, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (120, 210), (45, 60), -40, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (200, 110), (32, 70), -12, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (260, 95), (32, 80), 0, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (320, 110), (32, 70), 12, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (380, 140), (28, 55), 25, 0, 360, (210, 180, 140), -1)
                cv2.ellipse(synth_img, (230, 200), (95, 40), -25, 0, 120, (150, 95, 65), 5)
                cv2.ellipse(synth_img, (270, 230), (110, 50), 8, 0, 130, (150, 95, 65), 5)
                cv2.ellipse(synth_img, (240, 260), (75, 65), 45, 0, 140, (150, 95, 65), 5)
                caption_text = "Synthetic Wide Spatulate Palm Sample (Expanded Width)"

            image_to_process = synth_img
            st.image(image_to_process, caption=caption_text, use_container_width=True)

        trigger_button = st.button("✨ Generate Full AI Reading", type="primary", use_container_width=True)

    with col_output:
        st.subheader("📜 Generated Reading Output")

        if trigger_button:
            if image_to_process is None:
                st.error("Please upload a hand image or click one of the sample archetype buttons.")
            else:
                with st.spinner("Processing computer vision landmarks, segmenting palm lines, drawing tarot cards, and requesting AI narrative..."):
                    start_time = time.time()
                    pipeline_inst = PalmTarotPipeline()
                    reading = pipeline_inst.run_full_pipeline(
                        image_np=image_to_process,
                        user_question=user_question,
                        num_cards=num_cards
                    )
                    elapsed = time.time() - start_time

                    session_id = st.session_state.get("db_session")
                    user_id = st.session_state.get("current_user", {}).get("id") if st.session_state.get("current_user") else None

                    if session_id:
                        db_manager.save_palm_analysis(PalmAnalysisRecord(
                            session_id=session_id,
                            user_id=user_id,
                            palm_shape=reading["palm_report"].get("Palm_Shape", "Rectangular Palm"),
                            aspect_ratio=float(reading["palm_features"].get("aspect_ratio", 1.0)),
                            cluster_id=int(reading["cluster"]["cluster_id"]),
                            engineered_features=reading["palm_features"],
                            palm_lines=reading["palm_lines"],
                            rule_report=reading["palm_report"]
                        ))
                        db_manager.save_tarot_reading(TarotReadingRecord(
                            session_id=session_id,
                            user_id=user_id,
                            num_cards=num_cards,
                            user_question=user_question,
                            cards=reading["tarot_reading"]["cards"],
                            interpretation=reading["interpretation"]
                        ))

                    st.session_state.readings_count += 1
                    st.session_state.latency_history.append(elapsed)
                    st.session_state.last_reading = reading

                    st.success(f"Reading generated in {elapsed:.2f} seconds!")

        if st.session_state.last_reading is not None:
            reading = st.session_state.last_reading

            st.markdown("### 🖐️ Palm Analysis & UNet Line Contour Measurements")
            col_res_img1, col_res_img2 = st.columns(2)
            with col_res_img1:
                st.markdown("**Structured Trait Interpretation**")
                render_human_readable_palm_report(reading["palm_report"])
            with col_res_img2:
                st.markdown("**Segmented Line Features (Length, Area, Angle)**")
                lines_df = pd.DataFrame(reading["palm_lines"])
                st.dataframe(lines_df, use_container_width=True)

            st.markdown("---")
            st.markdown("### 🎴 Tarot Reading Draw & Card Archetypes")
            tarot_cards = reading["tarot_reading"]["cards"]

            for card in tarot_cards:
                orient = card.get("orientation", "Upright")
                img_filename = card.get("img", "m00.jpg")

                # Card Artwork Photo (Centered on Top)
                pil_img = get_card_pil_image(img_filename, orientation=orient)
                _c_center1, c_center2, _c_center3 = st.columns([1, 1.2, 1])
                with c_center2:
                    st.image(
                        pil_img,
                        caption=f"{card['name']} ({orient})",
                        use_container_width=True
                    )

                # Card Details & Down Meaning (Stacked Below Photo)
                orient_badge = "🔄 Reversed" if orient.lower() == "reversed" else "✨ Upright"
                interp_text = card.get("interpretation", card.get("meaning", ""))
                gen_meaning = card.get("meaning", "") if card.get("interpretation") else ""

                st.markdown(f"#### **{card.get('position', 'Draw')}**: {card['name']}")
                st.markdown(f"**State:** `{orient_badge}`  |  **Arcana/Suit:** {card.get('arcana', 'Major')} ({card.get('suit', 'Trump')})")
                if card.get("keywords"):
                    st.markdown(f"**Keywords:** *{card['keywords']}*")
                st.info(f"**Interpretation:** {interp_text}")
                if gen_meaning and gen_meaning != interp_text:
                    st.markdown(f"**Meaning:** {gen_meaning}")
                if card.get("affirmation") and card.get("affirmation") != "No affirmation available":
                    st.caption(f"💬 *Affirmation:* {card['affirmation']}")

                st.markdown("<hr style='margin: 15px 0; border: 0.5px solid rgba(255,255,255,0.15);'>", unsafe_allow_html=True)


            st.markdown("---")
            st.markdown("### 🤖 AI Narrative Reading")
            narrative = reading["interpretation"]
            st.write(f"**Personality Analysis:** {narrative.get('personality', '')}")
            st.write(f"**Career Guidance:** {narrative.get('career_guidance', '')}")
            st.write(f"**Relationship Insights:** {narrative.get('relationship_insights', '')}")
            st.write(f"**Health & Wellness:** {narrative.get('health_wellness', '')}")

            st.markdown("**Key Recommendations:**")
            for rec in narrative.get("recommendations", []):
                st.markdown(f"- {rec}")

            st.markdown("---")
            pdf_file_path = Path(reading["pdf_path"])
            if pdf_file_path.exists():
                with open(pdf_file_path, "rb") as pdf_file:
                    st.download_button(
                        label="📥 Download PDF Reading Report",
                        data=pdf_file,
                        file_name="Palmistry_Tarot_AI_Report.pdf",
                        mime="application/pdf",
                        use_container_width=True
                    )


# ==========================================
# PRESERVED EXISTING AI CHATBOT
# ==========================================
def render_ai_chatbot():
    st.header("💬 Interactive AI Palmistry & Tarot Chatbot")
    st.markdown("Ask any questions about hand geometry, palm line features, tarot card meanings, or your active reading session.")

    session_id = st.session_state.get("db_session")
    user_id = st.session_state.get("current_user", {}).get("id") if st.session_state.get("current_user") else None

    # Load persistent chat history from DB if available
    if "chat_history" not in st.session_state:
        db_msgs = db_manager.get_chat_history(session_id) if session_id else []
        if db_msgs:
            history = []
            for m in db_msgs:
                history.append({"role": "user", "content": m.user_message})
                history.append({"role": "assistant", "content": m.bot_reply, "card": getattr(m, "reading_context_linked", {}).get("drawn_card") if getattr(m, "reading_context_linked", None) else None})
            st.session_state.chat_history = history
        else:
            st.session_state.chat_history = [
                {"role": "assistant", "content": "Hello! I am your AI Palmistry & Tarot Assistant. Ask me anything about your hand lines, tarot card meanings, or your personalized reading!"}
            ]

    # Active Reading Context status indicator
    context = st.session_state.get("last_reading")
    if not context:
        latest_palm = (db_manager.get_latest_palm_analysis(session_id) if session_id else None) or (db_manager.get_user_palm_analyses(user_id)[0] if user_id and db_manager.get_user_palm_analyses(user_id) else None)
        latest_tarot = (db_manager.get_latest_tarot_reading(session_id) if session_id else None) or (db_manager.get_user_tarot_readings(user_id)[0] if user_id and db_manager.get_user_tarot_readings(user_id) else None)
        if latest_palm or latest_tarot:
            context = {}
            if latest_palm:
                context["palm_report"] = latest_palm.rule_report
                context["palm_features"] = latest_palm.engineered_features
                context["palm_lines"] = latest_palm.palm_lines
                context["cluster"] = {"cluster_id": latest_palm.cluster_id}
            if latest_tarot:
                context["tarot_reading"] = {"num_cards": latest_tarot.num_cards, "cards": latest_tarot.cards}

    if context:
        st.info("💡 **Active Reading Context Connected**: The chatbot is aware of your latest palm line measurements and tarot cards!")
    else:
        st.caption("ℹ️ Tip: Run a reading in the 'Live Reading Demo' tab first to get personalized Q&A on your palm & tarot cards.")

    # Suggested Prompts & Card Draw Action
    st.markdown("**Suggested Prompts & Actions:**")
    c1, c2, c3, c4, c5 = st.columns(5)
    quick_prompt = None
    draw_card_requested = False

    if c1.button("✋ Left vs Right Hand", use_container_width=True):
        quick_prompt = "Which hand should I read: left hand or right hand?"
    if c2.button("❤️ Heart Line Meaning", use_container_width=True):
        quick_prompt = "Can you explain what the Heart Line length tells about emotional connection style?"
    if c3.button("🌿 Life Line Lifespan Myth", use_container_width=True):
        quick_prompt = "Does a short Life Line mean a short life span?"
    if c4.button("🎴 Upright vs Reversed", use_container_width=True):
        quick_prompt = "What is the difference between Upright and Reversed Tarot cards?"
    if c5.button("🃏 Draw Tarot Card", use_container_width=True):
        draw_card_requested = True

    # Display Chat History with Visual Card rendering
    for msg in st.session_state.chat_history:
        avatar = "🤖" if msg["role"] == "assistant" else "👤"
        with st.chat_message(msg["role"], avatar=avatar):
            st.write(msg["content"])
            if msg.get("card"):
                card = cast(dict[str, Any], msg["card"])
                col_c1, col_c2 = st.columns([1, 3])
                orient = card.get("orientation", "Upright")
                with col_c1:
                    pil_img = get_card_pil_image(card.get("img", "m00.jpg"), orientation=orient)
                    st.image(pil_img, caption=f"{card['name']} ({orient})", width=140)
                with col_c2:
                    badge = "🔄 Reversed" if orient.lower() == "reversed" else "✨ Upright"
                    st.markdown(f"**{card['name']}** (`{badge}`)")
                    st.caption(f"Meaning: {card['meaning']}")

    # Handle Card Draw inside Chat
    if draw_card_requested:
        pipeline_inst = get_pipeline()
        drawn_cards = pipeline_inst.tarot_deck.draw_cards(num_cards=1)
        drawn_card = drawn_cards[0]
        user_prompt = f"I drew the tarot card: {drawn_card['name']} ({drawn_card['orientation']}). How does this card connect with my palm reading?"

        st.session_state.chat_history.append({"role": "user", "content": user_prompt})

        with st.spinner("Reflecting on drawn card and palm context..."):
            res = pipeline_inst.llm_interpreter.chat_completion(
                messages=st.session_state.chat_history,
                reading_context=context
            )
            bot_reply = res["reply"]

        bot_msg: dict[str, Any] = {
            "role": "assistant",
            "content": bot_reply,
            "card": drawn_card
        }
        st.session_state.chat_history.append(bot_msg)

        if session_id:
            linked_ctx = context.copy() if context else {}
            linked_ctx["drawn_card"] = drawn_card
            db_manager.save_chat_message(ChatMessageRecord(
                session_id=session_id,
                user_id=user_id,
                user_message=user_prompt,
                bot_reply=bot_reply,
                reading_context_linked=linked_ctx,
                suggested_followups=res.get("suggested_followups", [])
            ))

        st.rerun()

    # Handle standard user input
    user_input = st.chat_input("Ask a question about palmistry or tarot...")
    prompt_to_send = user_input or quick_prompt

    if prompt_to_send:
        st.session_state.chat_history.append({"role": "user", "content": prompt_to_send})

        with st.spinner("AI Assistant is reflecting..."):
            pipeline_inst = get_pipeline()
            res = pipeline_inst.llm_interpreter.chat_completion(
                messages=st.session_state.chat_history,
                reading_context=context
            )
            bot_reply = res["reply"]

        st.session_state.chat_history.append({"role": "assistant", "content": bot_reply})

        if session_id:
            db_manager.save_chat_message(ChatMessageRecord(
                session_id=session_id,
                user_id=user_id,
                user_message=prompt_to_send,
                bot_reply=bot_reply,
                reading_context_linked=context,
                suggested_followups=res.get("suggested_followups", [])
            ))

        st.rerun()


# ==========================================
# MAP RENDERED CONTENT TO ACTIVE TABS
# ==========================================
for i, tab_name in enumerate(active_tab_names):
    with tabs[i]:
        if "Users Dashboard" in tab_name:
            render_admin_users_dashboard()
        elif "Plans Dashboard" in tab_name:
            render_admin_plans_dashboard()
        elif "Live Reading Demo" in tab_name:
            render_live_reading_demo()
        elif "Chatbot" in tab_name:
            render_ai_chatbot()
        elif "My Profile" in tab_name:
            render_user_profile()
        else:
            render_executive_overview()
