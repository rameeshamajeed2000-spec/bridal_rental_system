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
    # Assign category based on name for existing demo data
    cursor.execute("UPDATE artists SET category='mehandi' WHERE name='shafreena'")
    cursor.execute("UPDATE artists SET category='makeup' WHERE name='rameesha'")
    db.commit()
    print("Categories updated successfully.")
    db.close()
except Exception as e:
    print(f"Error: {e}")
