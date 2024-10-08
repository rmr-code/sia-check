# utils.py

# 1. logger functions
# 2. file functions in agents folder in the host system
# 3. calls with the embeddings_server

import os
import shutil
import re
import requests
import threading
import logging
from config import settings
from typing import List, Any
from exceptions import FileStorageException, ExternalServiceException
# Setup logger configuration
def setup_logger() -> logging.Logger:
    # Set up the logging configuration based on the DEBUG mode in environment.
    #Logs to both console and file if enabled.
    logger = logging.getLogger("app_logger")
    logger.setLevel(logging.DEBUG if settings.debug else logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if settings.debug else logging.INFO)
    
    # File handler
    file_handler = logging.FileHandler("app.log")
    file_handler.setLevel(logging.DEBUG if settings.debug else logging.INFO)
    
    # Formatter for the log messages
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    # Apply formatter to both handlers
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    
    # Add handlers to the logger
    logger.addHandler(console_handler)
    #logger.addHandler(file_handler)
    
    return logger

# Initialize logger
logger = setup_logger()

# Log chat activity
def log_chat_activity(agent_name: str, user_message: str, assistant_response: str) -> None:
    # Log the interaction between a user and the assistant in the chat.
    logger.info(f"Agent: {agent_name}, User: {user_message}, Assistant: {assistant_response}")

# Santize agent name
def sanitize_agent_name(name):
    # Convert to lowercase
    name = name.lower()
    # Remove any character that is not a letter, digit, or hyphen
    name = re.sub(r'[^a-z0-9-]', '', name)
    return name

'''
# Helper function to save files
def save_files(agent_dir, files):
    try:
        # Create the directory for the agent if it doesn't exist
        if not os.path.exists(agent_dir):
            os.makedirs(agent_dir)

        for file in files:
            # create the path
            file_path = os.path.join(agent_dir, file.filename)
            file.save(file_path)

        return  
    except Exception as e:
         raise FileStorageException(detail=f"Error in saving files {str(e)}")

# Helper function to delete files
def delete_files(agent_dir, files_to_delete):
    try:
        for filename in files_to_delete:
            file_path = os.path.join(agent_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        
        return
    except Exception as e:
        raise FileStorageException(detail=f"Error in deleting files {str(e)}")

# Helper function to get all files for a given agent
def get_all_files(agent_dir):
    try:
        if not os.path.exists(agent_dir):
            return []

        # Retrieve all remaining files in the directory
        all_files = os.listdir(agent_dir)
        all_files.sort(key=lambda x: os.path.getmtime(os.path.join(agent_dir, x)))

        # Return the updated comma-delimited string of filenames
        return ", ".join(all_files) if all_files else ""
    
    except Exception as e:
        raise FileStorageException(detail=f"Error in listing files {str(e)}")
'''

# Process uploaded files and manage deletions
def process_uploaded_files(agent_name: str, new_files: List[Any] = [], deleted_files: str = "") -> str:
    
    try:
        # Log the processing of files
        logger.debug(f"Processing files for agent: {agent_name}")
        # set the agent dir
        agent_dir = os.path.join(settings.agents_dir, agent_name)
        # Ensure the agent directory exists
        os.makedirs(agent_dir, exist_ok=True)  
        # Step 1: Process deleted files (remove them from the agent's directory)
        if deleted_files:
            deleted_files_list = [file.strip() for file in deleted_files.split(",") if file.strip()]
            for file in deleted_files_list:
                file_path = os.path.join(agent_dir, file)
                if os.path.exists(file_path):
                    os.remove(file_path)

        # Step 2: Process new files (add them to the agent's directory)
        for file in new_files:
            file_path = os.path.join(agent_dir, file.filename)
            with open(file_path, "wb") as f:
                f.write(file.file.read())

        # Step 3: Retrieve all remaining files in the directory
        all_files = os.listdir(agent_dir)
        # Sort the files based on creation or modification date
        all_files.sort(key=lambda x: os.path.getmtime(os.path.join(agent_dir, x)))

        # Return the updated comma-delimited string of filenames
        return ", ".join(all_files) if all_files else ""

    except Exception as e:
        raise FileStorageException(detail=f"Error processing files of {agent_name}: {str(e)}")

# Trigger embeddings generation asynchronously
def trigger_embeddings_generation(agent_name: str) -> None:
    def generate_embeddings_task():
        try:
            logger.debug(f"Triggering embeddings generation for agent: {agent_name}")

            # set the url, headers
            url = f"http://{settings.embeddings_server}:{settings.embeddings_server_port}/generate"
            headers = {settings.header_name: settings.header_key}
            requests.post(url, json={"agent_name": agent_name}, headers=headers)
        except Exception as e:
            raise ExternalServiceException(detail=f"Failed to trigger embeddings generation for {agent_name}")

    # Run the task in a separate thread
    threading.Thread(target=generate_embeddings_task).start()

# Delete all files of an agent and its directory
def delete_agent_files(agent_name: str) -> None:
    # set the agent dir
    agent_dir = os.path.join(settings.agents_dir, agent_name)

    # Check if the agent directory exists
    if os.path.exists(agent_dir):
        shutil.rmtree(agent_dir)

# Query embeddings from the embeddings server
def query_embeddings(agent_name: str) -> List[Any]:
    try:
        url = f"http://{settings.embeddings_server}:{settings.embeddings_server_port}/query"
        headers = {
            "X-Requested-With": "XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl"
        }

        # Get the response
        response = requests.post(url, json={"agent_name": agent_name, "prompt": ""}, headers=headers)
        #response.raise_for_status()
        response_json = response.json()
        # Pick the document chunks
        document_chunks = response_json.get('results', [])
        return document_chunks

    except requests.exceptions.RequestException as e:
        raise ExternalServiceException(detail=f"Error querying embeddings for agent {agent_name}: {str(e)}")
