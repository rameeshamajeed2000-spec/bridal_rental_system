from gradio_client import Client
import sys

# Connect to the Hugging Face Space
client = Client("yisol/IDM-VTON")

# Redirect stdout to a file to capture view_api() output
old_stdout = sys.stdout
with open("scratch/idm_vton_api.txt", "w") as f:
    sys.stdout = f
    client.view_api()
    sys.stdout = old_stdout

print("Done! Check scratch/idm_vton_api.txt")
