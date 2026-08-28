from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class CreateSearchHistoryRequest(BaseModel):
    input_media_id: Optional[UUID] = None
    place_id: Optional[UUID] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    search_type: Optional[str] = Field(default=None, max_length=50)

    @model_validator(mode="after")
    def require_history_subject(self):
        if self.input_media_id is None and self.place_id is None:
            raise ValueError("input_media_id or place_id is required")
        return self


class MediaSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_name: str
    file_url: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    storage_path: str
    created_at: datetime


class PlaceSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    province: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    image_url: Optional[str] = None


class SearchHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    input_media_id: Optional[UUID] = None
    place_id: Optional[UUID] = None
    confidence_value: Optional[float] = None
    search_type: Optional[str] = None
    searched_at: datetime
    input_media: Optional[MediaSummary] = None
    place: Optional[PlaceSummary] = None

    # Flat fields match the current History React components directly.
    name: str
    location: str
    confidence: Optional[float] = None
    date: str
    time: str
    url: Optional[str] = None
    description: Optional[str] = None


class SearchHistoryListResponse(BaseModel):
    items: list[SearchHistoryItem]
    page: int
    page_size: int
    total_records: int
    total_pages: int


class DeleteSearchHistoryResponse(BaseModel):
    deleted: bool
    history_id: UUID
