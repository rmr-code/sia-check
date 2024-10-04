import os
from huggingface_hub import snapshot_download

# Use environment variables passed via docker-compose
repo_id = os.getenv("EMBEDDING_MODEL_NAME")
token = os.getenv("HF_API_TOKEN")
filename = os.getenv("EMBEDDING_MODEL_FILENAME")
model_dir = os.path.join(os.getenv("DATA_DIR", "data"), "models", repo_id)
DEBUG = os.getenv("DEBUG", "false").strip().lower() == "true"

snapshot_download(
    repo_id=repo_id,
    local_dir=model_dir,  # Ensure it's downloaded to /data/models
    token=token
)
