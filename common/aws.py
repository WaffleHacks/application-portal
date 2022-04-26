from typing import TYPE_CHECKING

import boto3

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client


def with_s3() -> "S3Client":
    """
    Get an S3 client
    """
    return boto3.client("s3")  # type: ignore
