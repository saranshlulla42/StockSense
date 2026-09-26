from backend.database import get_connection


def seed_database() -> None:
    connection = get_connection()
    try:
        connection.execute(
            "CREATE TABLE IF NOT EXISTS products "
            "(id INTEGER PRIMARY KEY, name TEXT NOT NULL, sku TEXT UNIQUE NOT NULL)"
        )
        connection.commit()
    finally:
        connection.close()


if __name__ == "__main__":
    seed_database()
