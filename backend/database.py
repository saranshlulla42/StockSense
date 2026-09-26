from collections.abc import Generator
from pathlib import Path
import sqlite3

DATABASE_PATH = Path(__file__).with_name("stocksense.db")


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def get_db() -> Generator[sqlite3.Connection, None, None]:
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()
