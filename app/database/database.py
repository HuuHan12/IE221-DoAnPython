import sqlite3

DATABASE_PATH = "landmark.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            content_type TEXT NOT NULL,
            size_bytes INTEGER NOT NULL,
            landmark TEXT NOT NULL,
            confidence REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()


def save_prediction(
    filename,
    content_type,
    size_bytes,
    landmark,
    confidence
):
    connection = get_connection()

    cursor = connection.execute("""
        INSERT INTO predictions (
            filename,
            content_type,
            size_bytes,
            landmark,
            confidence
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        filename,
        content_type,
        size_bytes,
        landmark,
        confidence
    ))

    connection.commit()

    prediction_id = cursor.lastrowid

    connection.close()

    return prediction_id