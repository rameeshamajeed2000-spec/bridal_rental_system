import os
import re

import mysql.connector
from mysql.connector import errorcode


DEFAULT_DB_NAME = "bridal_system"


def db_config(include_database=True):
    config = {
        "host": os.environ.get("DB_HOST", "localhost"),
        "user": os.environ.get("DB_USER", "root"),
        "password": os.environ.get("DB_PASSWORD", "password"),
    }
    if include_database:
        config["database"] = os.environ.get("DB_NAME", DEFAULT_DB_NAME)
    return config


def password_candidates():
    password = os.environ.get("DB_PASSWORD")
    if password is not None:
        return [password]
    return ["password", "@Ak101202", ""]


def get_db_name():
    return os.environ.get("DB_NAME", DEFAULT_DB_NAME)


def quote_identifier(identifier):
    if not re.fullmatch(r"[A-Za-z0-9_]+", identifier):
        raise ValueError(f"Unsafe database identifier: {identifier}")
    return f"`{identifier}`"


def connect(include_database=True):
    config = db_config(include_database=include_database)
    last_error = None
    for password in password_candidates():
        try:
            config["password"] = password
            return mysql.connector.connect(**config)
        except mysql.connector.Error as err:
            last_error = err
            if err.errno != errorcode.ER_ACCESS_DENIED_ERROR:
                raise
    raise last_error


def ensure_database_exists():
    db_name = get_db_name()
    server = connect(include_database=False)
    cursor = server.cursor()
    try:
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS {quote_identifier(db_name)} "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        server.commit()
    finally:
        cursor.close()
        server.close()


def ensure_column(cursor, table, column, definition):
    cursor.execute(f"SHOW COLUMNS FROM {quote_identifier(table)} LIKE %s", (column,))
    if cursor.fetchone() is None:
        cursor.execute(
            f"ALTER TABLE {quote_identifier(table)} "
            f"ADD COLUMN {quote_identifier(column)} {definition}"
        )


def ensure_schema(db=None):
    close_db = db is None
    if db is None:
        ensure_database_exists()
        db = connect(include_database=True)

    cursor = db.cursor()
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                role VARCHAR(50)
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                price VARCHAR(50),
                category VARCHAR(255),
                image VARCHAR(500),
                style VARCHAR(50) DEFAULT 'traditional'
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_email VARCHAR(255),
                item_id INT,
                item_type VARCHAR(255),
                booking_date DATE,
                time_slot VARCHAR(100),
                payment_status VARCHAR(50) DEFAULT 'Pending',
                amount VARCHAR(50),
                razorpay_order_id VARCHAR(255),
                razorpay_payment_id VARCHAR(255)
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS artists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                phone VARCHAR(50),
                category VARCHAR(100),
                experience VARCHAR(255),
                location VARCHAR(255),
                image VARCHAR(500),
                status VARCHAR(50) DEFAULT 'Active'
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS artist_works (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                price VARCHAR(50),
                image VARCHAR(500)
            )
            """
        )

        ensure_column(cursor, "products", "style", "VARCHAR(50) DEFAULT 'traditional'")
        ensure_column(cursor, "bookings", "payment_status", "VARCHAR(50) DEFAULT 'Pending'")
        ensure_column(cursor, "bookings", "amount", "VARCHAR(50)")
        ensure_column(cursor, "bookings", "razorpay_order_id", "VARCHAR(255)")
        ensure_column(cursor, "bookings", "razorpay_payment_id", "VARCHAR(255)")
        ensure_column(cursor, "artists", "category", "VARCHAR(100)")
        ensure_column(cursor, "artists", "status", "VARCHAR(50) DEFAULT 'Active'")
        db.commit()
    finally:
        cursor.close()
        if close_db:
            db.close()


def connect_with_schema():
    try:
        db = connect(include_database=True)
    except mysql.connector.Error as err:
        if err.errno != errorcode.ER_BAD_DB_ERROR:
            raise
        ensure_database_exists()
        db = connect(include_database=True)

    ensure_schema(db)
    return db
