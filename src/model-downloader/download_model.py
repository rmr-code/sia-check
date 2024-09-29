import os
from huggingface_hub import hf_hub_download

# Use environment variables passed via docker-compose
repo_id = os.getenv("EMBEDDING_MODEL_NAME")
token = os.getenv("HF_API_TOKEN")
filename = os.getenv("EMBEDDING_MODEL_FILENAME")
model_dir = "/data/models"  # Target directory inside the Docker container

# Check if the model has already been downloaded
model_path = os.path.join(model_dir, f"models--{repo_id.replace('/', '--')}")  

if not os.path.exists(model_path):
    # If the model doesn't exist, download it
    print("Model not found. Downloading model...")
    model_path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        cache_dir=model_dir,  # Ensure it's downloaded to /data/models
        use_auth_token=token
    )
    print(f"Model downloaded at: {model_path}")
else:
    print(f"Model already exists at: {model_path}")
