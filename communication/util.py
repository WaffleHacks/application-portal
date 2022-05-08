from string import Template

from mailer import BodyType

from common import SETTINGS
from common.database import Message, Participant
from common.mail import AsyncClient


async def send_message(recipient: Participant, message: Message, mailer: AsyncClient):
    """
    Send a templated message to the specified recipient
    :param recipient: who the message should be sent to
    :param message: the message to send
    :param mailer: a WaffleHacks mailer instance
    """
    template = Template(message.content)
    content = template.safe_substitute(
        first_name=recipient.first_name,
        last_name=recipient.last_name,
    )

    # Send the message
    await mailer.send(
        to_email=recipient.email,
        from_email=SETTINGS.communication.sender,
        subject=message.subject,
        body=content,
        body_type=BodyType.HTML,
        reply_to=SETTINGS.communication.reply_to,
    )
