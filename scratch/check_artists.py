import mysql.connector
import os

try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="bridal_system"
    )
    cursor = db.cursor()
    cursor.execute("SELECT * FROM artists")
    rows = cursor.fetchall()
    print(f"Total artists found: {len(rows)}")
    for row in rows:
        print(row)
    db.close()
except Exception as e:
    print(f"Error: {e}")
