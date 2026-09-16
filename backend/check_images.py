import os
import mysql.connector

def check_db():
    try:
        db = mysql.connector.connect(
            host=os.environ.get("DB_HOST", "localhost"),
            user=os.environ.get("DB_USER", "root"),
            password=os.environ.get("DB_PASSWORD", "password"),
            database=os.environ.get("DB_NAME", "bridal_system")
        )
        cursor = db.cursor()

        print("Checking PRODUCTS table:")
        cursor.execute("SELECT name, image FROM products")
        for (name, image) in cursor:
            print(f"Product: {name}, Image Path: {image}")
            full_path = os.path.join("c:\\Users\\Rameesha vp\\Desktop\\rame\\rame\\NEW\\backend", image.replace('/', '\\'))
            if os.path.exists(full_path):
                print(f"  [OK] File exists at {full_path}")
            else:
                print(f"  [MISSING] File MISSING at {full_path}")

        print("\nChecking ARTISTS table:")
        cursor.execute("SELECT name, image FROM artists")
        for (name, image) in cursor:
            print(f"Artist: {name}, Image Path: {image}")
            full_path = os.path.join("c:\\Users\\Rameesha vp\\Desktop\\rame\\rame\\NEW\\backend", image.replace('/', '\\'))
            if os.path.exists(full_path):
                print(f"  [OK] File exists at {full_path}")
            else:
                print(f"  [MISSING] File MISSING at {full_path}")

        db.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    check_db()
