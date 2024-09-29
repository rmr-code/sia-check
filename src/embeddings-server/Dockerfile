FROM python:3.12-slim

# Copy backend files
COPY ./requirements.txt .

# Install backend dependencies
RUN pip install  --no-cache-dir --upgrade -r requirements.txt

# Copy python code 
COPY . .

# start the uvicorn server
# remove --reload in produciton
# Command to run the application with the specified number of workers
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8002 --workers ${EMBEDDINGS_NO_WORKERS:-1}"]