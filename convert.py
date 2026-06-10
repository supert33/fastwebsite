import os
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()

files = {
    r"C:\Users\shubh\Downloads\IMG_4748.heic": "chilli_chicken.jpg",
    r"C:\Users\shubh\Downloads\IMG_5176.heic": "mango_mousse.jpg",
    r"C:\Users\shubh\Downloads\IMG_5296.heic": "pizza.jpg",
    r"C:\Users\shubh\Downloads\IMG_5433.heic": "caramel_cheesecake.jpg"
}

os.makedirs("assets", exist_ok=True)

for src, dst in files.items():
    if os.path.exists(src):
        img = Image.open(src)
        out_path = os.path.join("assets", dst)
        img.save(out_path, "JPEG", quality=85)
        print(f"Saved {out_path}")
    else:
        print(f"File not found: {src}")
