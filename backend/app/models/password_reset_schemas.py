from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


# ============================================================
# FORGOT PASSWORD
# ============================================================

class ForgotPasswordRequest(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )


    email: EmailStr


# ============================================================
# RESET PASSWORD
# ============================================================

class ResetPasswordRequest(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )


    token: str = Field(
        min_length=20,
        max_length=500,
    )


    new_password: str = Field(
        min_length=8,
        max_length=128,
    )