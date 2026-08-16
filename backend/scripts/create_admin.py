import getpass
import sys
from pathlib import Path

from sqlalchemy import select


BACKEND_DIR = (
    Path(__file__)
    .resolve()
    .parents[1]
)

sys.path.insert(
    0,
    str(BACKEND_DIR),
)


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


def main():
    init_database()

    email = input(
        "Administrator email: "
    ).strip().lower()

    database = SessionLocal()

    try:
        user = database.scalar(
            select(User).where(
                User.email == email
            )
        )

        if user:
            user.role = "administrator"
            user.is_active = True

            database.commit()

            print(
                "Existing account promoted "
                "to administrator."
            )

            return

        full_name = input(
            "Administrator name: "
        ).strip()

        password = getpass.getpass(
            "Administrator password: "
        )

        confirm_password = getpass.getpass(
            "Confirm password: "
        )

        if password != confirm_password:
            print(
                "Passwords do not match."
            )
            return

        if len(password) < 8:
            print(
                "Password must contain "
                "at least 8 characters."
            )
            return

        user = User(
            email=email,
            full_name=full_name,
            password_hash=(
                hash_password(
                    password
                )
            ),
            role="administrator",
            is_active=True,
        )

        database.add(user)
        database.commit()

        print(
            "Administrator created successfully."
        )

    finally:
        database.close()


if __name__ == "__main__":
    main()