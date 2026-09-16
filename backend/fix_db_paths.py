import mysql.connector

from db_utils import connect_with_schema

def fix_paths():
    try:
        db = connect_with_schema()
        cursor = db.cursor()

        # Fix products table
        print("Normalizing paths in products table...")
        cursor.execute("SELECT id, image FROM products")
        products = cursor.fetchall()
        for (prod_id, image) in products:
            if image and "\\" in image:
                new_image = image.replace("\\", "/")
                print(f"  Updating product {prod_id}: {image} -> {new_image}")
                cursor.execute("UPDATE products SET image=%s WHERE id=%s", (new_image, prod_id))

        # Fix artists table
        print("\nNormalizing paths in artists table...")
        cursor.execute("SELECT id, image FROM artists")
        artists = cursor.fetchall()
        for (art_id, image) in artists:
            if image and "\\" in image:
                new_image = image.replace("\\", "/")
                print(f"  Updating artist {art_id}: {image} -> {new_image}")
                cursor.execute("UPDATE artists SET image=%s WHERE id=%s", (new_image, art_id))

        db.commit()
        print("\nDatabase paths normalized successfully!")
        db.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    fix_paths()
