from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
import requests
import time
import mysql.connector
import razorpay
from fashn import Fashn
from fashn import APIStatusError, APIConnectionError, APITimeoutError
from db_utils import connect_with_schema
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

# Initialize Razorpay Client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
razor_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
TRYON_FOLDER = os.path.join(UPLOAD_FOLDER, "tryon_results")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TRYON_FOLDER, exist_ok=True)

# Database connection. If the configured database does not exist yet,
# connect_with_schema creates it and applies the expected tables/columns.
try:
    db = connect_with_schema()
    cursor = db.cursor()
except mysql.connector.Error as err:
    print(f"Warning: Database connection failed. Error: {err}")
    db = None
    cursor = None

@app.before_request
def check_db():
    if request.endpoint not in ['tryon', 'uploaded_file', 'static'] and cursor is None:
        if request.method == 'OPTIONS':
            return '', 200
        return jsonify({"message": "Database not configured or offline. Cannot process request."}), 500

# ============================================================
# 🔑 REPLICATE API KEY
# ============================================================
REPLICATE_API_KEY = os.getenv("REPLICATE_API_KEY")


def image_to_base64_dataurl(path):
    """Convert local image file to base64 data URL"""
    ext = path.split('.')[-1].lower()
    mime = 'image/jpeg' if ext in ['jpg', 'jpeg'] else f'image/{ext}'
    with open(path, 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    return f"data:{mime};base64,{encoded}"


def save_base64_dataurl(data_url, destination_path):
    if "," not in data_url:
        raise ValueError("Fashn returned invalid base64 image data.")

    _, encoded = data_url.split(",", 1)
    with open(destination_path, "wb") as f:
        f.write(base64.b64decode(encoded))


def save_uploaded_file(file_storage, prefix=""):
    filename = secure_filename(file_storage.filename or "")
    if not filename:
        raise ValueError("Uploaded file has no filename.")

    if prefix:
        filename = f"{prefix}_{filename}"

    file_storage.save(os.path.join(UPLOAD_FOLDER, filename))
    return f"uploads/{filename}"


def request_data():
    return request.get_json(silent=True) or {}


def is_item_available(item_id, item_type, booking_date, time_slot=None):
    if item_type == "product":
        sql = """
            SELECT id FROM bookings
            WHERE item_id=%s
              AND item_type='product'
              AND %s >= booking_date
              AND %s < DATE_ADD(booking_date, INTERVAL 2 DAY)
            LIMIT 1
        """
        cursor.execute(sql, (item_id, booking_date, booking_date))
    else:
        sql = """
            SELECT id FROM bookings
            WHERE item_id=%s AND item_type=%s AND booking_date=%s AND time_slot=%s
            LIMIT 1
        """
        cursor.execute(sql, (item_id, item_type, booking_date, time_slot))

    return cursor.fetchone() is None


def run_fashn_tryon(person_path, cloth_path):
    """
    Call Fashn.ai virtual try-on API
    """
    try:
        print("Connecting to Fashn.ai...")

        # Get Fashn API key from environment
        FASHN_API_KEY = os.getenv("FASHN_API_KEY")
        client = Fashn(api_key=FASHN_API_KEY)
        
        # Convert images to base64
        person_b64 = image_to_base64_dataurl(person_path)
        cloth_b64 = image_to_base64_dataurl(cloth_path)
        
        print("Starting Fashn.ai try-on generation...")
        result = client.predictions.subscribe(
            model_name="tryon-v1.6",
            inputs={
                "model_image": person_b64,
                "garment_image": cloth_b64,
                "category": "auto",
                "garment_photo_type": "auto",
                "mode": "balanced",
                "num_samples": 1,
                "output_format": "png",
                "return_base64": True
            }
        )
        
        if result.status != "completed":
            message = result.error.message if result.error else f"Fashn generation ended with status {result.status}."
            raise Exception(message)

        if hasattr(result, 'output') and isinstance(result.output, list) and len(result.output) > 0:
            return result.output[0]
        elif hasattr(result, 'error') and result.error is not None:
            raise Exception(f"Fashn API failed: {result.error.message}")
        else:
            raise Exception("Fashn API did not return an output image.")
    except APITimeoutError:
        raise Exception("Fashn request timed out. Please try again with smaller images.")
    except APIConnectionError:
        raise Exception("Could not connect to Fashn. Check your internet connection and try again.")
    except APIStatusError as e:
        if isinstance(e.body, dict):
            message = e.body.get("message") or e.body.get("error") or str(e.body)
        else:
            message = str(e)
        raise Exception(f"Fashn API rejected the request: {message}")
    except Exception as e:
        raise Exception(f"Fashn API error: {str(e)}")


# =========================
# 👤 AUTH APIs
# =========================

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request_data()
        if not data or not all(k in data for k in ('name', 'email', 'password', 'role')):
            return jsonify({"message": "Missing required fields"}), 400

        sql = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (data['name'], data['email'], data['password'], data['role']))
        db.commit()

        return jsonify({"message": "Registered successfully"})
    except mysql.connector.Error as err:
        if err.errno == 1062:
            return jsonify({"message": "Email already registered"}), 400
        return jsonify({"message": f"Database error: {str(err)}"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request_data()

    if not all(k in data for k in ('email', 'password', 'role')):
        return jsonify({"message": "Missing required fields"}), 400

    if data.get('email') == 'admin@gmail.com' and data.get('password') == 'admin123' and data.get('role') == 'admin':
        return jsonify({"message": "Login successful"})

    sql = "SELECT * FROM users WHERE email=%s AND password=%s AND role=%s"
    cursor.execute(sql, (data['email'], data['password'], data['role']))

    user = cursor.fetchone()

    if user:
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Invalid credentials"})


# =========================
# 📦 PRODUCT APIs
# =========================

@app.route('/upload_product', methods=['POST'])
def upload_product():
    try:
        name = request.form.get('name', '').strip()
        price = request.form.get('price', '').strip()
        category = request.form.get('category', '').strip()
        style = request.form.get('style', 'traditional')

        if not name or not price or not category:
            return jsonify({"message": "Name, price, and category are required"}), 400
        
        if 'image' not in request.files:
            return jsonify({"message": "No image uploaded"}), 400
            
        image = request.files['image']
        image_path = save_uploaded_file(image)

        sql = "INSERT INTO products (name, price, category, style, image) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (name, price, category, style, image_path))
        db.commit()

        return jsonify({"message": "Product uploaded"})
    except Exception as e:
        return jsonify({"message": f"Upload failed: {str(e)}"}), 500


@app.route('/products', methods=['GET'])
def get_products():
    cursor.execute("SELECT id, name, price, category, image, style FROM products")
    data = cursor.fetchall()

    products = []
    for row in data:
        image_path = str(row[4]).replace("\\", "/") if row[4] else ""
        
        products.append({
            "id": row[0],
            "name": row[1],
            "price": row[2],
            "category": row[3],
            "image": image_path,
            "style": row[5] or "traditional"
        })

    return jsonify(products)


@app.route('/update_product/<int:product_id>', methods=['POST'])
def update_product(product_id):
    name = request.form.get('name', '').strip()
    price = request.form.get('price', '').strip()
    category = request.form.get('category', '').strip()
    style = request.form.get('style', 'traditional')

    if not name or not price or not category:
        return jsonify({"message": "Name, price, and category are required"}), 400
    
    if 'image' in request.files and request.files['image'].filename:
        image = request.files['image']
        image_path = save_uploaded_file(image)
        sql = "UPDATE products SET name=%s, price=%s, category=%s, style=%s, image=%s WHERE id=%s"
        cursor.execute(sql, (name, price, category, style, image_path, product_id))
    else:
        sql = "UPDATE products SET name=%s, price=%s, category=%s, style=%s WHERE id=%s"
        cursor.execute(sql, (name, price, category, style, product_id))
    
    db.commit()
    return jsonify({"message": "Product updated successfully"})


@app.route('/delete_product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    cursor.execute("DELETE FROM products WHERE id=%s", (product_id,))
    db.commit()
    return jsonify({"message": "Product deleted successfully"})


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    if filename.startswith('uploads/'):
        filename = filename[len('uploads/'):]
    return send_from_directory(UPLOAD_FOLDER, filename)


# =========================
# 🧠 AI VIRTUAL TRY-ON
# =========================

@app.route('/tryon', methods=['POST'])
def tryon():
    """
    AI-powered virtual try-on endpoint.
    
    Accepts:
      - person: uploaded image file of the person
      - cloth_path: path to the product/cloth image (from DB)
    
    Returns:
      - output_url: URL to the generated try-on image
      - output_local: local path for serving
    """
    if 'person' not in request.files:
        return jsonify({"error": "No person image uploaded"}), 400

    person_file = request.files['person']
    cloth_path = request.form.get('cloth_path', '')

    if not cloth_path:
        return jsonify({"error": "No cloth image path provided"}), 400

    person_filename = f"person_{int(time.time())}_{person_file.filename}"
    person_path = os.path.join(UPLOAD_FOLDER, person_filename)
    person_file.save(person_path)

    full_cloth_path = cloth_path.lstrip('/').replace("\\", "/")
    if not os.path.isabs(full_cloth_path):
        full_cloth_path = os.path.join(BASE_DIR, full_cloth_path)
    if not os.path.exists(full_cloth_path):
        return jsonify({"error": f"Cloth image not found: {full_cloth_path}"}), 404

    garment_des = request.form.get('garment_des', 'full body elegant bridal dress')
    auto_crop = request.form.get('auto_crop', 'true') == 'true'
    try:
        denoise_steps = int(request.form.get('denoise_steps', '30'))
    except ValueError:
        denoise_steps = 30

    try:
        output_data = run_fashn_tryon(
            person_path, 
            full_cloth_path
        )

        result_filename = f"result_{int(time.time())}.png"
        local_path = os.path.join(TRYON_FOLDER, result_filename)
        if isinstance(output_data, str) and output_data.startswith("data:image"):
            save_base64_dataurl(output_data, local_path)
        else:
            response = requests.get(output_data, stream=True, timeout=60)
            response.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)

        return jsonify({
            "success": True,
            "output_url": None,
            "output_local": f"uploads/tryon_results/{result_filename}"
        })

    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 502


# =========================
# 📅 BOOKING SYSTEM
# =========================
# 💳 PAYMENT & BOOKING APIs
# =========================

@app.route('/create_order', methods=['POST'])
def create_order():
    try:
        data = request_data()
        amount_value = float(data.get('amount', 0))
        if amount_value <= 0:
            return jsonify({"error": "Valid amount is required"}), 400

        amount = int(amount_value * 100)

        order_data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"receipt_{int(time.time())}",
            "payment_capture": 1
        }

        order = razor_client.order.create(data=order_data)
        return jsonify(order)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/verify_payment', methods=['POST'])
def verify_payment():
    try:
        data = request_data()
        required = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'email', 'item_id', 'type', 'date', 'amount']
        if not all(k in data and data[k] not in (None, '') for k in required):
            return jsonify({"success": False, "message": "Missing payment or booking details"}), 400

        time_slot = data.get('time_slot') or ''
        params_dict = {
            'razorpay_order_id': data['razorpay_order_id'],
            'razorpay_payment_id': data['razorpay_payment_id'],
            'razorpay_signature': data['razorpay_signature']
        }

        razor_client.utility.verify_payment_signature(params_dict)

        if not is_item_available(data['item_id'], data['type'], data['date'], time_slot):
            return jsonify({
                "success": False,
                "message": "This item is not available for the selected date."
            })

        sql = """INSERT INTO bookings 
                 (user_email, item_id, item_type, booking_date, time_slot, payment_status, amount, razorpay_order_id, razorpay_payment_id) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        cursor.execute(sql, (
            data['email'],
            data['item_id'],
            data['type'],
            data['date'],
            time_slot,
            "Paid",
            data['amount'],
            data['razorpay_order_id'],
            data['razorpay_payment_id']
        ))
        db.commit()

        return jsonify({"success": True, "message": "Payment verified and booking confirmed!"})
    except Exception as e:
        return jsonify({"success": False, "message": "Payment verification failed!", "error": str(e)}), 400


@app.route('/check_availability', methods=['POST'])
def check_availability():
    data = request_data()
    if not all(k in data and data[k] not in (None, '') for k in ('item_id', 'date')):
        return jsonify({"available": False, "message": "Item and date are required"}), 400

    item_type = data.get('type', 'product')

    return jsonify({
        "available": is_item_available(
            data['item_id'],
            item_type,
            data['date'],
            data.get('time_slot')
        )
    })


@app.route('/book', methods=['POST'])
def book():
    data = request_data()
    required = ['email', 'item_id', 'type', 'date']
    if not all(k in data and data[k] not in (None, '') for k in required):
        return jsonify({"message": "Missing booking details"}), 400

    time_slot = data.get('time_slot') or ''

    if not is_item_available(data['item_id'], data['type'], data['date'], time_slot):
        return jsonify({"message": "Already booked!"})

    sql = """INSERT INTO bookings 
             (user_email, item_id, item_type, booking_date, time_slot, payment_status, amount) 
             VALUES (%s, %s, %s, %s, %s, %s, %s)"""

    cursor.execute(sql, (
        data['email'],
        data['item_id'],
        data['type'],
        data['date'],
        time_slot,
        data.get('payment_status', 'Pending'),
        data.get('amount', '0')
    ))
    db.commit()

    return jsonify({"message": "Booking successful"})


# =========================
# 📊 ADMIN APIs
# =========================

@app.route('/all_bookings', methods=['GET'])
def all_bookings():
    cursor.execute("""
        SELECT id, user_email, item_id, item_type, booking_date, time_slot,
               payment_status, amount
        FROM bookings
        ORDER BY booking_date DESC, id DESC
    """)
    data = cursor.fetchall()

    bookings = []
    for row in data:
        bookings.append({
            "id": row[0],
            "email": row[1],
            "item_id": row[2],
            "type": row[3],
            "date": str(row[4]),
            "time": row[5],
            "status": row[6] if len(row) > 6 else "Pending",
            "amount": row[7] if len(row) > 7 else "0"
        })

    return jsonify(bookings)


@app.route('/my_bookings/<email>', methods=['GET'])
def my_bookings(email):
    cursor.execute("""
        SELECT id, user_email, item_id, item_type, booking_date, time_slot,
               payment_status, amount
        FROM bookings
        WHERE user_email=%s
        ORDER BY booking_date DESC, id DESC
    """, (email,))
    data = cursor.fetchall()

    bookings = []
    for row in data:
        bookings.append({
            "id": row[0],
            "item_id": row[2],
            "type": row[3],
            "date": str(row[4]),
            "time": row[5],
            "status": row[6] if len(row) > 6 else "Pending",
            "amount": row[7] if len(row) > 7 else "0"
        })

    return jsonify(bookings)


@app.route('/artist_bookings/<category>', methods=['GET'])
def artist_bookings(category):
    cursor.execute("""
        SELECT id, user_email, item_id, item_type, booking_date, time_slot,
               payment_status, amount
        FROM bookings
        WHERE item_type=%s
        ORDER BY booking_date DESC, id DESC
    """, (category,))
    data = cursor.fetchall()

    bookings = []
    for row in data:
        bookings.append({
            "id": row[0],
            "email": row[1],
            "item_id": row[2],
            "type": row[3],
            "date": str(row[4]),
            "time": row[5],
            "status": row[6] if len(row) > 6 else "Pending",
            "amount": row[7] if len(row) > 7 else "0"
        })

    return jsonify(bookings)


@app.route('/artists/<category>', methods=['GET'])
def get_artists(category):
    cursor.execute("SELECT id, name, phone, category, experience, location, image FROM artists WHERE category=%s AND (status = 'Active' OR status IS NULL)", (category,))
    data = cursor.fetchall()
    artists = []
    for row in data:
        artists.append({
            "id": row[0],
            "name": row[1],
            "phone": row[2],
            "category": row[3],
            "experience": row[4],
            "location": row[5],
            "image": str(row[6]).replace("\\", "/") if row[6] else ""
        })
    return jsonify(artists)


@app.route('/all_artists', methods=['GET'])
def all_artists():
    cursor.execute("SELECT id, name, phone, category, experience, location, image, status FROM artists")
    data = cursor.fetchall()
    artists = []
    for row in data:
        artists.append({
            "id": row[0],
            "name": row[1],
            "phone": row[2],
            "category": row[3],
            "experience": row[4],
            "location": row[5],
            "image": str(row[6]).replace("\\", "/") if row[6] else "",
            "status": row[7] if len(row) > 7 and row[7] else "Active"
        })
    return jsonify(artists)


@app.route('/toggle_artist_status/<int:artist_id>', methods=['POST'])
def toggle_artist_status(artist_id):
    try:
        cursor.execute("SELECT status FROM artists WHERE id=%s", (artist_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"message": "Artist not found"}), 404
            
        current_status = result[0] if (len(result) > 0 and result[0]) else 'Active'
        new_status = 'Deactivated' if current_status == 'Active' else 'Active'
        
        cursor.execute("UPDATE artists SET status=%s WHERE id=%s", (new_status, artist_id))
        db.commit()
        return jsonify({"message": f"Artist status updated to {new_status}", "status": new_status})
    except Exception as e:
        return jsonify({"message": f"Failed: {str(e)}"}), 500


@app.route('/delete_artist/<int:artist_id>', methods=['DELETE'])
def delete_artist(artist_id):
    try:
        cursor.execute("DELETE FROM artists WHERE id=%s", (artist_id,))
        db.commit()
        return jsonify({"message": "Artist deleted successfully"})
    except Exception as e:
        return jsonify({"message": f"Failed: {str(e)}"}), 500


@app.route('/all_users', methods=['GET'])
def all_users():
    cursor.execute("SELECT id, name, email, role FROM users")
    data = cursor.fetchall()
    users = []
    for row in data:
        users.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3]
        })
    return jsonify(users)


@app.route('/artist_profile', methods=['POST'])
def artist_profile():
    try:
        name = request.form.get('name', '').strip()
        phone = request.form.get('phone', '').strip()
        category = request.form.get('category', '').strip()
        exp = request.form.get('experience', '').strip()
        location = request.form.get('location', '').strip()

        if not all([name, phone, category, exp, location]) or 'image' not in request.files:
            return jsonify({"message": "All profile fields and an image are required"}), 400

        image = request.files['image']
        image_path = save_uploaded_file(image)

        cursor.execute(
            "INSERT INTO artists (name, phone, category, experience, location, image) VALUES (%s,%s,%s,%s,%s,%s)",
            (name, phone, category, exp, location, image_path)
        )
        db.commit()

        return jsonify({"message": "Saved"})
    except Exception as e:
        return jsonify({"message": f"Failed: {str(e)}"}), 500


@app.route('/upload_work', methods=['POST'])
def upload_work():
    try:
        name = request.form.get('name', '').strip()
        price = request.form.get('price', '').strip()
        if not name or not price or 'image' not in request.files:
            return jsonify({"message": "Name, price, and image are required"}), 400

        image = request.files['image']
        image_path = save_uploaded_file(image)

        cursor.execute(
            "INSERT INTO artist_works (name, price, image) VALUES (%s,%s,%s)",
            (name, price, image_path)
        )
        db.commit()

        return jsonify({"message": "Uploaded"})
    except Exception as e:
        return jsonify({"message": f"Failed: {str(e)}"}), 500


# =========================

if __name__ == '__main__':
    app.run(debug=True)