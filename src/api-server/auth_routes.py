# auth_routes.py

from fastapi import APIRouter, Request, Response, Body, HTTPException
from typing import Dict, Any
from auth import (
    is_admin_password_set,
    set_admin_password,
    check_admin_password,
    change_admin_password,
    create_access_token,
    verify_x_api_key,
    verify_jwt_token
)
from utils import logger
from config import settings
import inspect

# Create router
auth_router = APIRouter()

# Check if admin password is set
@auth_router.get("/is-admin-password-set")
async def route_check_admin_password_set(request: Request) -> Dict[str, bool]:
    try:
        # Verify X-API-Key header
        verify_x_api_key(headers=request.headers)
        # check whether password has been set
        res = is_admin_password_set()
        # return true or false
        return {"admin_password_set": res}
    
    except HTTPException as e:
        # Custom HttpExceptions, pass them to the global handler
        raise e
    except Exception as e:
        # Unexpected errors, wrap them in an HttpException with status 500
        raise HTTPException(detail=str(e), status_code=500)


# Check if token is valid
@auth_router.get("/check-token")
def route_check_jwt_token(request: Request) -> Dict[str, str]:
    try:
        # Verify X-API-Key header
        verify_x_api_key(headers=request.headers)

        # Verify JWT token
        access_token = request.cookies.get("access_token")
        verify_jwt_token(access_token=access_token)

        return {"message": "Token is valid"}

    except HTTPException as e:
        raise e
    except Exception as e:
         raise HTTPException(detail=str(e), status_code=500)


# Admin login route
@auth_router.post("/login")
def route_login(request: Request, response: Response, body: Dict[str, Any] = Body(...)) -> Dict[str, str]:
    try:
        # Verify X-API-Key header
        verify_x_api_key(headers=request.headers)

        # Extract password from request body
        password = body.get("password", "")
        if not password:
            raise HTTPException(status_code=400, detail="Password cannot be blank")

        # Check the admin password
        check_admin_password(password=password)

        # Generate access token
        access_token = create_access_token(data={"sub": "admin"})

        # Set JWT token in cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=settings.access_token_expire_minutes * 60,
            expires=settings.access_token_expire_minutes * 60,
            secure=settings.is_https,
            samesite="lax",
        )

        return {"message": "Login successful"}

    except HTTPException as e:
        raise e
    except Exception as e:
         raise HTTPException(detail=str(e), status_code=500)


# Route to logout
@auth_router.post("/logout")
def route_logout(response: Response):
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        expires=0,
        max_age=0,
    )
    return {"message": "Logout successful"}


# Set admin password route
@auth_router.post("/set-admin-password")
def route_set_admin_password(request: Request, body: Dict[str, Any] = Body(...)) -> Dict[str, str]:
    try:
        # Verify X-API-Key header
        verify_x_api_key(headers=request.headers)

        # Extract password from request body
        password = body.get("password", "")
        if not password:
            raise HTTPException(status_code=400, detail="Password cannot be blank")

        # Set the admin password
        set_admin_password(password=password)
        return {"msg": "Admin password set successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
         raise HTTPException(detail=str(e), status_code=500)


# Change admin password route
@auth_router.post("/change-admin-password")
def route_change_admin_password(request: Request, body: Dict[str, Any] = Body(...)) -> Dict[str, str]:
    try:
        # Verify X-API-Key header
        verify_x_api_key(headers=request.headers)

        # Verify JWT token
        access_token = request.cookies.get("access_token")
        verify_jwt_token(access_token=access_token)

        # Extract current and new password from request body
        current_password = body.get("current_password", "")
        new_password = body.get("new_password", "")
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Password cannot be blank")

        # Change admin password
        change_admin_password(current_password=current_password, new_password=new_password)
        
        # return
        return {"message": "Admin password changed successfully"}

    except HTTPException as e:
            raise e
    except Exception as e:
         raise HTTPException(detail=str(e), status_code=500)
