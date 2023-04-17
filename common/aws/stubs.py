from typing import TYPE_CHECKING, Any, Dict, List

from botocore.client import BaseClient

# All classes in this file should not be used directly
# They are strictly for type-checking purposes


if TYPE_CHECKING:

    class S3Client(BaseClient):
        def generate_presigned_post(
            self,
            Bucket: str,
            Key: str,
            Fields: Dict[str, Any],
            Conditions: List[Any],
            ExpiresIn: int = 3600,
        ) -> Dict[str, Any]:
            pass
