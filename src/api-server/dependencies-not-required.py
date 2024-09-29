# dependencies.py

import logging
from fastapi import Header, HTTPException, Cookie
from starlette.datastructures import Headers
from typing import Dict, Optional
from config import settings
from auth import verify_jwt_token
from exceptions import AuthenticationException, ValidationException
from utils import setup_logger

# Initialize logger
logger = setup_logger()

# Verify the X-API-Key header
def verify_x_api_key(headers: Headers) -> str:
    try:
        # Retrieve the API key from headers
        x_api_key = headers.get(settings.header_name)

        # Check if the API key exists
        if x_api_key is None:
            raise ValidationException(message="X-API-Key header missing", status_code=400)

        # Validate the API key
        if x_api_key != settings.header_key:
            raise AuthenticationException(message="Invalid X-API-Key", status_code=401)

        return x_api_key

    except ValidationException as e:
        # Log validation error
        logger.error(f"API key validation error: {e.message}")
        raise e

    except AuthenticationException as e:
        # Log authentication error
        logger.error(f"Authentication error: {e.message}")
        raise e


# Extract the current user from the JWT token in cookies
async def get_jwt_user(access_token: Optional[str] = Cookie(None)) -> Dict[str, str]:
    try:
        # Check if the access token is present
        if access_token is None:
            raise AuthenticationException(message="Access token is missing in cookies", status_code=403)

        # Verify and decode the JWT token
        payload = verify_jwt_token(token=access_token)

        # Extract the username from the token payload
        username = payload.get("sub")
        if username is None:
            raise AuthenticationException(message="Invalid user", status_code=401)

        # Return user information
        return {"username": username}

    except AuthenticationException as e:
        # Log authentication error
        logger.error(f"Authentication error: {e.message}")
        raise e
