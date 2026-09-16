import mysql.connector

from db_utils import connect_with_schema

try:
    db = connect_with_schema()
    cursor = db.cursor()

    cursor.execute('SELECT * FROM users WHERE email=%s', ('admin@gmail.com',))
    if cursor.fetchone():
        cursor.execute('UPDATE users SET password=%s WHERE email=%s', ('admin123', 'admin@gmail.com'))
        print("Admin user updated.")
    else:
        cursor.execute('INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)', ('Admin', 'admin@gmail.com', 'admin123', 'admin'))
        print("Admin user created.")

    db.commit()

except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if 'cursor' in locals() and cursor:
        cursor.close()
    if 'db' in locals() and db:
        db.close()
