# agent_routes.py

from fastapi import APIRouter, Request, Response, Form, File, UploadFile, HTTPException
from typing import Dict, Any, List, Optional
from auth import verify_x_api_key, verify_jwt_token
from agent import (
    save_agent,
    change_agent,
    delete_agent,
    get_agents,
    get_agent,
    update_agent_embeddings_status,
)
from utils import (
    logger,
    sanitize_agent_name,
    process_uploaded_files,
    trigger_embeddings_generation,
    delete_agent_files,
)

agent_router = APIRouter()


# Route to fetch all agents
@agent_router.get("/")
def route_agents(request: Request) -> Dict[str, List[Dict[str, Any]]]:
    try:
        # Verify API Key and JWT Token
        verify_x_api_key(headers=request.headers)
        access_token = request.cookies.get("access_token")
        verify_jwt_token(access_token=access_token)

        # Fetch agents
        agents: List[Dict[str, Any]] = get_agents()
        return {"list": agents}

    except Exception as e:
        # Log and propagate exception to global handler
        logger.error(f"Error fetching agents: {e}")
        raise e


# Route to create agent and upload optional files
@agent_router.post("/")
def route_save_agent(
    request: Request,
    name: str = Form(...),
    instructions: str = Form(""),
    welcome_message: str = Form(""),
    suggested_prompts: str = Form(""),
    new_files: List[UploadFile] = File([]),
) -> Dict[str, Any]:
    try:
        # Verify API Key and JWT Token
        verify_x_api_key(headers=request.headers)
        access_token = request.cookies.get("access_token")
        verify_jwt_token(access_token=access_token)

        # Check for missing agent name
        if not name:
            raise HTTPException(status_code=400, detail="Agent name cannot be blank")

        # Sanitize the name
        sanitized_name = sanitize_agent_name(name)

        # Process and save files
        file_names_str = process_uploaded_files(agent_name=sanitized_name, new_files=new_files)

        embeddings_status = ""
        # Trigger embeddings generation if files are added
        #if file_names_str:
            #trigger_embeddings_generation()
            #embeddings_status = "I"

        # Save agent data
        agent = save_agent(
            name=sanitized_name,
            instructions=instructions,
            welcome_message=welcome_message,
            suggested_prompts=suggested_prompts,
            files=file_names_str
        )

        return {"agent": agent}

    except Exception as e:
        # Log and propagate exception to global handler
        logger.error(f"Error saving agent: {e}")
        raise e


# Route to update an agent, handling both field updates and file uploads
@agent_router.put("/{agent_name}")
def route_update_agent(
    request: Request,
    agent_name: str,
    files: str = Form(""),
    instructions: str = Form(""),
    welcome_message: str = Form(""),
    suggested_prompts: str = Form(""),
    new_files: List[UploadFile] = File([]),
    deleted_files: str = Form(""),
) -> Dict[str, Any]:
    try:
        # Verify API Key and JWT Token
        verify_x_api_key(headers=request.headers)
        access_token = request.cookies.get("access_token")
        verify_jwt_token(access_token=access_token)

        # Process files
        file_names_str = process_uploaded_files(
            agent_name=agent_name,
            new_files=new_files,
            deleted_files=deleted_files,
        )
        
        embeddings_status = ""
        # Trigger embeddings generation if files were modified
        if new_files or deleted_files:
            trigger_embeddings_generation(agent_name=agent_name)
            embeddings_status="I"

        # Update agent in the database
        agent = change_agent(
            name=agent_name,
            instructions=instructions,
            welcome_message=welcome_message,
            suggested_prompts=suggested_prompts,
            files=file_names_str,
            embeddings_status=embeddings_status,
        )
        return {"agent": agent}

    except Exception as e:
        # Log and propagate exception to global handler
        logger.error(f"Error updating agent: {e}")
        raise e


# Route to fetch a specific agent by name
@agent_router.get("/{agent_name}")
def route_get_agent(agent_name: str, request: Request) -> Dict[str, Any]:
    try:
        # Verify API Key and JWT Token
        verify_x_api_key(headers=request.headers)
        access_token = request.cookies.get("access_token")
        verify_jwt_token(access_token=access_token)

        # Ensure agent_name is provided
        if not agent_name:
            raise HTTPException(status_code=400, detail="Agent name cannot be blank")

        # Get agent details
        agent: Dict[str, Any] = get_agent(name=agent_name)
        return {"agent": agent}

    except Exception as e:
        # Log and propagate exception to global handler
        logger.error(f"Error fetching agent '{agent_name}': {str(e)}")
        raise e


# Route to delete an agent by name, along with its associated files
@agent_router.delete("/{agent_name}")
def route_delete_agent(request: Request, agent_name: str) -> Response:
    try:
        # Verify API Key and JWT Token
        verify_x_api_key(headers=request.headers)
        access_token = request.cookies.get("access_token")
        verify_jwt_token(access_token=access_token)

        # Delete agent files
        delete_agent_files(agent_name=agent_name)

        # Delete agent from the database
        delete_agent(name=agent_name)

        return Response(
            content=f"Agent '{agent_name}' deleted successfully.", status_code=200
        )

    except Exception as e:
        # Log and propagate exception to global handler
        logger.error(f"Error deleting agent '{agent_name}': {e}")
        raise e


# Route to update embeddings status of an agent
@agent_router.post("/{agent_name}/update-embeddings-status")
def route_update_embeddings_status(agent_name: str, request: Request) -> Dict[str, str]:
    try:
        # Verify API Key which has been set in embeddings-server
        verify_x_api_key(headers=request.headers)

        # Check if agent_name is provided
        if not agent_name:
            raise HTTPException(status_code=400, detail="Agent name missing")

        # Update embeddings status
        update_agent_embeddings_status(name=agent_name, embeddings_status="")

        return {"message": "Embeddings status updated successfully"}

    except Exception as e:
        # Log and propagate exception to global handler
        logger.error(f"Error updating embeddings status for agent '{agent_name}': {e}")
        raise e