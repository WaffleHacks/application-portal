from string import Template

from mailer import BodyType
from opentelemetry import trace

from common import SETTINGS
from common.database import Message, Participant
from common.mail import AsyncClient

tracer = trace.get_tracer(__name__)


async def send_message(recipient: Participant, message: Message, mailer: AsyncClient):
    """
    Send a templated message to the specified recipient
    :param recipient: who the message should be sent to
    :param message: the message to send
    :param mailer: a WaffleHacks mailer instance
    """
    with tracer.start_as_current_span("send"):
        with tracer.start_as_current_span("render"):
            template = Template(message.rendered)
            content = template.safe_substitute(
                first_name=recipient.first_name,
                last_name=recipient.last_name,
            )

        # Send the message
        with tracer.start_as_current_span("dispatch"):
            await mailer.send(
                to_email=recipient.email,
                from_email=SETTINGS.communication.sender,
                subject=message.subject,
                body=content,
                body_type=BodyType.HTML if message.is_html else BodyType.PLAIN,
                reply_to=SETTINGS.communication.reply_to,
            )
