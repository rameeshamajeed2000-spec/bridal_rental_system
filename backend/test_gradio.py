from gradio_client import Client, handle_file
import os

person_path = "uploads/person_dummy.jpg"
cloth_path = "uploads/cloth_dummy.jpg"

# Create dummy files
os.makedirs("uploads", exist_ok=True)
with open(person_path, "wb") as f:
    f.write(b"fake image data")
with open(cloth_path, "wb") as f:
    f.write(b"fake image data")

try:
    client = Client("yisol/IDM-VTON")
    
    result = client.predict(
        dict={"background": handle_file(person_path), "layers": [], "composite": None},
        garm_img=handle_file(cloth_path),
        garment_des="elegant bridal outfit",
        is_checked=True,
        is_checked_crop=False,
        denoise_steps=30,
        seed=42,
        api_name="/tryon"
    )
    print("Success:", result)
except Exception as e:
    print("Error:", e)
