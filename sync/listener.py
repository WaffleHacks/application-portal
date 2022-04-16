from typing import TYPE_CHECKING, Iterator, List

from .models import Message, Response

if TYPE_CHECKING:
    from mypy_boto3_sqs.client import SQSClient


class Listener(object):
    """
    Abstracts polling for messages from the queue as an iterator
    """

    def __init__(self, url: str, client: "SQSClient"):
        self.client = client
        self.url = url

        self.messages: List[Message] = []

    def __iter__(self) -> Iterator[Message]:
        return self

    def __next__(self) -> Message:
        while len(self.messages) == 0:
            self.__poll()

        return self.messages.pop()

    def __poll(self):
        """
        Poll for the next messages in the queue
        """
        raw = self.client.receive_message(QueueUrl=self.url, MaxNumberOfMessages=10)
        response = Response(**raw)
        self.messages = response.messages
