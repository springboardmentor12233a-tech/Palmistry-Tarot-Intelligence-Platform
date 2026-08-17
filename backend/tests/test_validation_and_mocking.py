import app.routes.reading_routes as reading_routes


# ============================================================
# VALID COMPLETE READING REQUEST
# ============================================================

VALID_READING_REQUEST = {

    "user_profile": {

        "name":
            "Test User",

        "age_group":
            "18-25",

        "interests": [
            "Career",
            "Education",
            "Personal Growth",
        ],

        "spiritual_goal": (
            "Improve focus and "
            "personal growth"
        ),

        "reading_preference":
            "Detailed",
    },


    "reading_context": {

        "question": (
            "What should I focus "
            "on right now?"
        ),

        "category":
            "Career",
    },


    "palm_analysis": {

        "heart_line":
            "short",

        "head_line":
            "long",

        "life_line":
            "short",
    },


    "tarot_analysis": {

        "spread":
            "Single Card",

        "cards": [

            {

                "position":
                    "Guidance",

                "name":
                    "The Fool",

                "orientation":
                    "upright",

                "keywords": [
                    "Beginnings",
                    "Opportunity",
                ],

                "selected_meaning": (
                    "A new beginning may "
                    "require an open and "
                    "flexible mindset."
                ),
            }

        ],
    },
}


# ============================================================
# MOCK COMPLETE READING RESPONSE
# ============================================================

def mock_complete_reading_result():

    reading = {

        "interpretation": {

            "overall_summary": (
                "This is a mocked "
                "overall summary."
            ),

            "palm_interpretation": (
                "This is a mocked "
                "palm interpretation."
            ),

            "tarot_interpretation": (
                "This is a mocked "
                "tarot interpretation."
            ),

            "combined_interpretation": (
                "This is a mocked "
                "combined interpretation."
            ),

            "key_strengths": [
                "Adaptability",
                "Focus",
            ],

            "growth_areas": [
                "Patience",
                "Consistency",
            ],

            "current_focus": (
                "Focus on practical "
                "development."
            ),

            "key_message": (
                "Continue learning "
                "and improving."
            ),

            "reflection_question": (
                "What action can "
                "you take today?"
            ),

            "disclaimer": (
                "For entertainment and "
                "personal reflection only."
            ),
        },


        "personality": {

            "personality_summary": (
                "Mock personality "
                "summary."
            ),

            "dominant_traits": [
                "Curious",
                "Focused",
            ],

            "emotional_style": (
                "Thoughtful emotional "
                "style."
            ),

            "thinking_style": (
                "Analytical thinking "
                "style."
            ),

            "decision_style": (
                "Balanced decision-making "
                "style."
            ),

            "relationship_style": (
                "Supportive relationship "
                "style."
            ),

            "strengths": [
                "Learning ability",
                "Adaptability",
            ],

            "development_areas": [
                "Consistency",
                "Patience",
            ],

            "growth_advice": [
                "Create clear goals.",
                "Review progress regularly.",
            ],
        },


        "recommendations": {

            "recommendation_summary": (
                "Mock recommendation "
                "summary."
            ),

            "personal_growth": [
                "Build consistent habits."
            ],

            "career": [
                "Develop practical skills."
            ],

            "relationships": [
                "Communicate clearly."
            ],

            "goal_alignment": [
                "Connect daily tasks "
                "with goals."
            ],

            "spiritual_development": [
                "Use reflection regularly."
            ],

            "immediate_actions": [
                "Plan the next study session."
            ],

            "long_term_actions": [
                "Track development monthly."
            ],
        },


        "trends": {

            "trend_summary": (
                "Mock trend summary."
            ),

            "current_theme": (
                "Learning and development."
            ),

            "next_30_days": (
                "Focus on building "
                "consistency."
            ),

            "next_3_months": (
                "Progress may come through "
                "continuous learning."
            ),

            "opportunities": [
                "Skill development"
            ],

            "challenges": [
                "Maintaining consistency"
            ],

            "recommended_focus": [
                "Structured learning"
            ],

            "practical_actions": [
                "Create weekly goals."
            ],

            "disclaimer": (
                "Symbolic themes only, "
                "not guaranteed predictions."
            ),
        },
    }


    scores = {

        "palm_analysis_confidence":
            80.0,

        "tarot_interpretation_relevance":
            85.0,

        "personality_alignment":
            82.0,

        "user_context_relevance":
            88.0,

        "reading_consistency":
            84.0,

        "overall_insight_score":
            83.8,

        "score_label":
            "Strong Alignment",

        "calculation_method": (
            "Mock weighted prototype "
            "scoring."
        ),

        "disclaimer": (
            "Prototype quality and "
            "consistency score only."
        ),
    }


    return (
        reading,
        scores,
    )


# ============================================================
# PALM VALIDATION
# ============================================================

def test_palm_analyze_without_file(
    client,
):

    response = client.post(
        "/api/palm/analyze"
    )

    assert (
        response.status_code
        == 422
    )


# ============================================================
# COMPLETE READING REQUIRES AUTH
# ============================================================

def test_complete_reading_requires_authentication(
    client,
):

    response = client.post(
        "/api/readings/generate-complete",

        json=VALID_READING_REQUEST,
    )

    assert (
        response.status_code
        == 401
    )


# ============================================================
# COMPLETE READING WITHOUT BODY
# ============================================================

def test_complete_reading_without_body(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.post(
        "/api/readings/generate-complete",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 422
    )


# ============================================================
# INCOMPLETE BODY
# ============================================================

def test_complete_reading_with_incomplete_body(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.post(
        "/api/readings/generate-complete",

        headers=(
            account[
                "headers"
            ]
        ),

        json={
            "user_profile": {
                "name":
                    "Test User"
            }
        },
    )

    assert (
        response.status_code
        == 422
    )


# ============================================================
# PDF AUTHENTICATION / VALIDATION
# ============================================================

def test_pdf_report_requires_authentication(
    client,
):

    response = client.post(
        "/api/reports/reading-pdf"
    )

    assert (
        response.status_code
        == 401
    )


def test_pdf_report_without_body(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.post(
        "/api/reports/reading-pdf",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 422
    )

# ============================================================
# ANALYTICS LIMIT VALIDATION
# ============================================================

def test_history_limit_zero(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/analytics/history?limit=0",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 422
    )


# ============================================================
# MOCK GEMINI / READING SERVICE
# ============================================================

def test_complete_reading_with_mock_service(
    client,
    authenticated_user,
    monkeypatch,
):

    account = authenticated_user(
        role="user"
    )


    def fake_generate_complete_reading(
        request,
    ):

        return (
            mock_complete_reading_result()
        )


    monkeypatch.setattr(
        reading_routes,
        "generate_complete_reading",
        fake_generate_complete_reading,
    )


    response = client.post(
        "/api/readings/generate-complete",

        headers=(
            account[
                "headers"
            ]
        ),

        json=VALID_READING_REQUEST,
    )


    assert (
        response.status_code
        == 200
    ), response.text


    data = response.json()


    assert (
        data["status"]
        == "success"
    )


    assert (
        "reading"
        in data
    )


    assert (
        "scores"
        in data
    )


    assert (
        data[
            "reading"
        ][
            "interpretation"
        ][
            "overall_summary"
        ]
        ==
        "This is a mocked overall summary."
    )


    assert (
        data[
            "scores"
        ][
            "overall_insight_score"
        ]
        == 83.8
    )


# ============================================================
# BACKEND ERROR HANDLING
# ============================================================

def test_complete_reading_service_failure(
    client,
    authenticated_user,
    monkeypatch,
):

    account = authenticated_user(
        role="user"
    )


    def fake_failed_service(
        request,
    ):

        raise RuntimeError(
            "Mock AI service failure"
        )


    monkeypatch.setattr(
        reading_routes,
        "generate_complete_reading",
        fake_failed_service,
    )


    response = client.post(
        "/api/readings/generate-complete",

        headers=(
            account[
                "headers"
            ]
        ),

        json=VALID_READING_REQUEST,
    )


    assert (
        response.status_code
        == 500
    )


    data = response.json()


    assert (
        "message"
        in data
    )


    assert (
        data["status"]
        == "error"
    )


    assert (
        data["message"]
        ==
        (
            "The complete personalized "
            "reading could not be generated."
        )
    )