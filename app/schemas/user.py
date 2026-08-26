from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = Field(
        default=None,
        max_length=255
    )


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=1,
        max_length=128
    )


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(
        min_length=1,
        max_length=128
    )

    new_password: str = Field(
        min_length=8,
        max_length=128
    )


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(
        default=None,
        max_length=255
    )

    avatar_media_id: Optional[UUID] = None


class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = None

    full_name: Optional[str] = Field(
        default=None,
        max_length=255
    )

    avatar_media_id: Optional[UUID] = None


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    full_name: Optional[str]
    avatar_media_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    status: str
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    profile: Optional[UserProfileResponse] = None


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str