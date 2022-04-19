import json
from enum import Enum
from hashlib import md5
from typing import Dict, List, Optional

from pydantic import BaseModel, root_validator


class Message(BaseModel):
    id: str
    receipt_handle: str
    body: str
    body_md5: str

    @root_validator()
    def check_md5(cls, values):
        body = values.get("body")
        expected = values.get("body_md5")

        if type(body) == str:
            computed = md5(body.encode()).hexdigest()
            assert computed == expected, "body md5 must be valid"

        return values

    class Config:
        fields = {
            "id": "MessageId",
            "receipt_handle": "ReceiptHandle",
            "body": "Body",
            "body_md5": "MD5OfBody",
        }


class ResponseMetadata(BaseModel):
    request_id: str
    http_status_code: int
    http_headers: Dict[str, str]
    retry_attempts: int

    class Config:
        fields = {
            "request_id": "RequestId",
            "http_status_code": "HTTPStatusCode",
            "http_headers": "HTTPHeaders",
            "retry_attempts": "RetryAttempts",
        }


class Response(BaseModel):
    messages: List[Message] = []
    metadata: ResponseMetadata

    class Config:
        fields = {"messages": "Messages", "metadata": "ResponseMetadata"}


class ActionType(Enum):
    Insert = "INSERT"
    Modify = "MODIFY"
    Remove = "REMOVE"

    def __str__(self):
        return self.value


class Profile(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str

    class Config:
        fields = {"first_name": "firstName", "last_name": "lastName"}


class Action(BaseModel):
    type: ActionType
    id: str
    profile: Optional[Profile]

    @classmethod
    def load(cls, source: str):
        raw = json.loads(source)
        return cls(**raw)
