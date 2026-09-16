import mysql.connector

from db_utils import ensure_schema


def migrate_db():
    try:
        ensure_schema()
        print("Database schema is up to date.")
    except mysql.connector.Error as err:
        print(f"Error during migration: {err}")
    except ValueError as err:
        print(f"Invalid database configuration: {err}")


if __name__ == "__main__":
    migrate_db()
