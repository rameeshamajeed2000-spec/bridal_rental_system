import mysql.connector

from db_utils import ensure_schema, get_db_name


def init_db():
    try:
        print(f"Creating database '{get_db_name()}' and tables if needed...")
        ensure_schema()
        print("Database and tables initialized successfully.")
    except mysql.connector.Error as err:
        print(f"Error initializing database: {err}")
    except ValueError as err:
        print(f"Invalid database configuration: {err}")


if __name__ == "__main__":
    init_db()
