from typing import IO, Any, Dict, List, Literal

from botocore.client import BaseClient

# All classes in this file should not be used directly
# They are strictly for type-checking purposes

ObjectCannedACLType = Literal[
    "authenticated-read",
    "aws-exec-read",
    "bucket-owner-full-control",
    "bucket-owner-read",
    "private",
    "public-read",
    "public-read-write",
]


class S3Client(BaseClient):
    def generate_presigned_post(  # type: ignore [empty-body]
        self,
        Bucket: str,
        Key: str,
        Fields: Dict[str, Any],
        Conditions: List[Any],
        ExpiresIn: int = 3600,
    ) -> Dict[str, Any]:
        pass

    def put_object(  # type: ignore [empty-body]
        self,
        Bucket: str,
        Key: str,
        Body: IO[Any],
        ACL: ObjectCannedACLType,
        ContentType: str,
    ) -> Dict[str, Any]:
        pass
