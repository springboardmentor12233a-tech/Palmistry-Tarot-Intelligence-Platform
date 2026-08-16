import getpass
import sys
from pathlib import Path

from sqlalchemy import select


# ============================================================
# ADD BACKEND DIRECTORY TO PYTHON PATH
# ============================================================

BACKEND_DIR = (
    Path(__file__)
    .resolve()
    .parents[1]
)

sys.path.insert(
    0,
    str(BACKEND_DIR),
)


# ============================================================
# PROJECT IMPORTS
# ============================================================

from app.core.database import (  # noqa: E402
    SessionLocal,
    init_database,
)

from app.core.security import (  # noqa: E402
    hash_password,
)

from app.models.database_models import (  # noqa: E402
    User,
)


# ============================================================
# RESET ADMIN PASSWORD
# ============================================================

def main():

    init_database()

    print()
    print(
        "========================================"
    )
    print(
        " Administrator Password Reset"
    )
    print(
        "========================================"
    )
    print()


    email = input(
        "Administrator email: "
    ).strip().lower()


    database = SessionLocal()


    try:

        # ----------------------------------------------------
        # FIND USER
        # ----------------------------------------------------

        user = database.scalar(
            select(User).where(
                User.email == email
            )
        )


        if not user:

            print()
            print(
                "ERROR: No account was found "
                "with this email."
            )

            return


        # ----------------------------------------------------
        # CHECK ROLE
        # ----------------------------------------------------

        if (
            user.role !=
            "administrator"
        ):

            print()
            print(
                "ERROR: This account is not "
                "an administrator account."
            )

            print(
                f"Current role: {user.role}"
            )

            return


        # ----------------------------------------------------
        # NEW PASSWORD
        # ----------------------------------------------------

        print()

        password = getpass.getpass(
            "New administrator password: "
        )


        confirm_password = (
            getpass.getpass(
                "Confirm new password: "
            )
        )


        # ----------------------------------------------------
        # VALIDATION
        # ----------------------------------------------------

        if (
            password !=
            confirm_password
        ):

            print()
            print(
                "ERROR: Passwords do not match."
            )

            return


        if (
            len(password) <
            8
        ):

            print()
            print(
                "ERROR: Password must contain "
                "at least 8 characters."
            )

            return


        # ----------------------------------------------------
        # UPDATE PASSWORD
        # ----------------------------------------------------

        user.password_hash = (
            hash_password(
                password
            )
        )


        database.add(
            user
        )

        database.commit()

        database.refresh(
            user
        )


        # ----------------------------------------------------
        # SUCCESS
        # ----------------------------------------------------

        print()
        print(
            "Password reset successfully."
        )

        print(
            f"Email: {user.email}"
        )

        print(
            f"Role: {user.role}"
        )

        print(
            f"Active: {user.is_active}"
        )

        print()
        print(
            "You can now log in using "
            "the new password."
        )


    except Exception as error:

        database.rollback()

        print()
        print(
            "Password reset failed."
        )

        print(
            f"Error: {error}"
        )


    finally:

        database.close()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()